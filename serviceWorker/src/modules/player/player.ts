import { Stream } from "../stream/stream";
import { Setting } from "./setting.interface";
import { StreamType } from "../stream/interface/stream.enum";
import { Server } from "../stream/interface/stream.types";
import { blankAds, mergeWithBackups } from "./m3u8";
import { AdClass, detectAds, isCleanBackup } from "./ad-detector";
import { parseVariants } from "../stream/master";
import type { PurpleEvent, WorkerContext } from "../../scope";

// F-09 (docs/feat.md)
export const DEFAULT_BACKUP_PLAYER_TYPES: string[] = [
  StreamType.SITE,
  StreamType.POPOUT,
  StreamType.FRONTPAGE,
  StreamType.PICTURE,
  StreamType.MOBILE_WEB,
  StreamType.EMBED,
];

// F-10: how long a type whose backup had ads (or announced its own break) is left out of the chain
export const CONTAMINATED_MS = 5000;
// F-14: how long after the last poll that listed it an ad URI is still answered with the blank segment (as Brave's script)
export const BLANK_TTL_MS = 120_000;

export class Player {
  integrityToken = ""; //the integrity token

  streamList: Stream[] = []; //the list of streams that are currently being played
  actualChannel: string = ""; //the channel
  playingAds = false; //if the stream is playing ads
  setting: Setting | undefined; //the settings
  quality: string = ""; //the quality of the stream
  freeStream: boolean = false; //if the stream is free
  private playerVariants = new Map<string, Stream>(); //variant URL (without query) of the player's masters -> stream
  private pinnedType: string | null = null; // F-10: type of the last clean backup delivered
  private contaminatedUntil = new Map<string, number>(); // F-10: type -> time (ms) until which it is skipped
  private blankUris = new Map<string, number>(); // F-14: ad URI -> time (ms) of the last poll that listed it

  constructor(private readonly scope: WorkerContext) {}

  getQuality = () => this.scope.postMessage({ type: "getQuality" });
  getSettings = () => this.scope.postMessage({ type: "getSettings" });
  pause = () => this.scope.postMessage({ type: "pause" });
  play = () => this.scope.postMessage({ type: "play" });

  setSettings = (setting: Setting) => {
    this.setting = setting;
    this.scope.logger("Settings loaded");
  };

  setIntegrityToken = (integrityToken: string) => this.integrityToken = integrityToken;

  pauseAndPlay = async () => {
    this.pause();
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.play();
    this.play();
  };

  onStartAds = () => {
    this.scope.logger("ads started");
    this.pauseAndPlay();
  };
  onEndAds = () => {
    this.scope.logger("ads ended");
    this.pauseAndPlay();
  };

  isAds = (x: string, allowChange: boolean = false) => {
    const ads = this.hasAds(x);
    // const ads: boolean = Math.random() < 0;
    if (!allowChange) return ads;
    if (this.playingAds != ads) this.pauseAndPlay();
    this.playingAds = ads;

    return this.playingAds;
  }

  // some ads are not in the principal stream
  freeStreamChanged(x: boolean) {
    this.scope.logger("freeStreamChanged:", x);
    // call pause and play when changed
    if (this.freeStream != x) this.pauseAndPlay();
    this.freeStream = x;
  }

  // ad segments in the playlist (F-02, F-03); markers over live segments alone (MARKED_LIVE) are not ads here
  hasAds = (x: string) => detectAds(x ?? "").class === AdClass.SSAI;

  currentStream = (channel: string = this.actualChannel): Stream => {
    return this.streamList?.find((x: Stream) => x.channelName === channel)!;
  };

  isWhitelist(): boolean {
    return this.setting?.whitelist?.includes(this.actualChannel) || false;
  }

  // `url`: the media playlist's URL, to resolve relative segment URIs (T-502)
  async onFetch(text: string, url: string = ""): Promise<string> {
    // no stream stored for the channel yet (media playlist before the usher)
    if (!this.currentStream()) return text;
    if (this.isWhitelist()) {
      this.emit({ type: "whitelisted" });
      return text;
    }
    // T-202: markers over live segments: the ad comes client-side (F-04); no backup, no pause/play.
    // F-14: a stitched break announced past the last segment (B-034) ends with prefetch lines to its first ad segments,
    // which the player fetched before the first poll with ad segments: they go, and their URIs are answered blank
    if (detectAds(text).class === AdClass.MARKED_LIVE) {
      if (this.setting?.stripFallback === false) return text;
      const announced = blankAds(text, [], url);
      if (!announced.uris.length) return text;
      this.listBlank(announced.uris, announced.uris.length);
      return announced.text;
    }
    // is ads and is the principal stream
    if (!this.isAds(text, true)) {
      this.scope.logger("Stream is free");
      this.freeStream = false;
      return text;
    }
    this.emit({ type: "adDetected" });

    const dump: string[] = [];

    // F-09: the first backup without ads replaces the playlist (E4); a type without one gets a new token.
    // F-10: a type whose backup had ads is skipped for CONTAMINATED_MS, with no fetch and no token request.
    for (const type of this.backupPlayerTypes()) {
      if ((this.contaminatedUntil.get(type) ?? 0) > Date.now()) continue;
      const backup = await this.fetchm3u8ByStreamType(type);
      if (!backup.data) this.currentStream().createStreamAccess(type, this.integrityToken, type === StreamType.AUTOPLAY ? "android" : "web");
      if (backup.dump) dump.push(...backup.dump);
      if (backup.contaminated && !backup.data) this.contaminatedUntil.set(type, Date.now() + CONTAMINATED_MS);
      if (backup.data) {
        if (type !== StreamType.AUTOPLAY) this.pinnedType = type;
        this.emit({ type: "backupUsed", playerType: type });
        return backup.data;
      }
    }

    if (dump?.length) {
      this.freeStreamChanged(true);
    } else {
      this.freeStreamChanged(false);
    }
    
    const merged = mergeWithBackups([text, ...dump]);
    if (merged.replaced) this.emit({ type: "segmentsReplaced", count: merged.replaced });
    // F-14: the ad segments left are answered with the blank segment when the player requests them (stripFallback)
    if (!merged.remaining.length || this.setting?.stripFallback === false) return merged.text;
    const blanked = blankAds(merged.text, merged.remaining, url);
    this.listBlank(blanked.uris, blanked.segments);
    return blanked.text;
  }


  // F-09: the setting's list (default: DEFAULT_BACKUP_PLAYER_TYPES); autoplay only with lowQualityFallback (default on), last.
  // F-10: with pinBackupPlayerType (default on), the type of the last clean backup goes first.
  backupPlayerTypes(): string[] {
    const types = (this.setting?.backupPlayerTypes ?? DEFAULT_BACKUP_PLAYER_TYPES).filter((type) => type !== StreamType.AUTOPLAY);
    const pinned = this.setting?.pinBackupPlayerType !== false && this.pinnedType && types.includes(this.pinnedType) ? this.pinnedType : null;
    const ordered = pinned ? [pinned, ...types.filter((type) => type !== pinned)] : types;
    return this.setting?.lowQualityFallback === false ? ordered : [...ordered, StreamType.AUTOPLAY];
  }

  async fetchm3u8ByStreamType(accessType: StreamType | string): Promise<{ data: string | null; dump: string[]; contaminated: boolean }> {
    let dump: string[] = [];
    let data: string = "";
    let contaminated = false;

    let servers: Server[] = this.currentStream().getStreamByStreamType(accessType);

    // do the all request in same time
    for (const server of servers) {
      //filter server url by quality or bestquality
      const streamUrl = server.findByQuality(this.quality) || server.bestQuality();

      //try get m3u8 content and return if don't have ads.
      // a backup without a URL or that fails to load is dropped; the next one is tried
      let text: string;
      try {
        if (!streamUrl) throw new Error("Stream Type: " + accessType + " - no variant");
        const response: Response = await this.scope.request(streamUrl.url);
        if (!response.ok) throw new Error("Stream Type: " + accessType + " - status " + response.status);
        text = await response.text();
      } catch (e) {
        this.scope.logger(e);
        this.currentStream().removeServer(server);
        continue;
      }
      dump.push(text);
      // T-204: a backup announcing its own break is dropped like one with ads; its live segments still serve the merge
      if (!isCleanBackup(text)) {
        this.scope.logger("Stream Type: " + accessType + (this.isAds(text) ? " - Ads found" : " - Break announced"));
        this.currentStream().removeServer(server);
        contaminated = true;
        continue;
      } else {
        data = text;
        this.scope.logger("Stream Type: " + accessType + " - Free Stream");
        break;
      }

    }

    return { data: data, dump: dump, contaminated };
  }

  // Variants of a master the player requested: their media playlists are recognized by URL, whatever their path.
  setPlayerMaster(text: string) {
    for (const variant of parseVariants(text)) this.playerVariants.set(withoutQuery(variant.url), this.currentStream());
  }

  isPlayerPlaylist = (url: string) => this.playerVariants.has(withoutQuery(url));

  // F-14: `uris` are answered with the blank segment from now on; blankInserted counts the new ones among the first `counted`
  private listBlank(uris: string[], counted: number) {
    const now = Date.now();
    const added = uris.slice(0, counted).filter((uri) => !this.isBlankSegment(uri)).length;
    for (const [uri, at] of this.blankUris) if (now - at > BLANK_TTL_MS) this.blankUris.delete(uri);
    for (const uri of uris) this.blankUris.set(uri, now);
    if (added) this.emit({ type: "blankInserted", count: added });
  }

  // F-14: an ad URI listed by a poll in the last BLANK_TTL_MS, answered with the blank segment instead of Twitch's
  isBlankSegment = (url: string) => {
    const at = this.blankUris.get(url);
    return at != null && Date.now() - at <= BLANK_TTL_MS;
  };

  // debug event (F-17) for the current channel
  private emit(event: Omit<PurpleEvent, "channel">) {
    this.scope.emit?.({ ...event, channel: this.actualChannel });
  }

  setChannel(channelName: string) {
    this.scope.logger(`Loading channel ${channelName}`);
    this.actualChannel = channelName;

    let currentStream = this.streamList.find((stream) => stream.channelName === channelName);
    if (!currentStream) {
      currentStream = new Stream(channelName, this.scope);
      this.streamList.push(currentStream);
    }
  }
}

const withoutQuery = (url: string) => url.split(/[?#]/)[0];
