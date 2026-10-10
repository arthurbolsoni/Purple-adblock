import { Stream } from "../stream/stream";
import { Setting } from "./setting.interface";
import { StreamType } from "../stream/interface/stream.enum";
import { Server, StreamUrl, type VariantTarget } from "../stream/interface/stream.types";
import { blankAds, mergeWithBackups, stripAdDateranges } from "./m3u8";
import { AdClass, detectAds, isCleanBackup } from "./ad-detector";
import { AdBreak } from "./ad-break";
import { newestNumber, sequenceReference, sequenceShift, shiftSequence, type SequenceReference } from "./sequence";
import { parseVariants } from "../stream/master";
import type { PurpleEvent, WorkerContext } from "../../scope";

// F-09 (docs/feat.md). T-819: the types that give 720p first; picture-by-picture (360p only) after them, so a break
// that rotates through backups stays at 720p when one of them is clean
export const DEFAULT_BACKUP_PLAYER_TYPES: string[] = [
  StreamType.SITE,
  StreamType.POPOUT,
  StreamType.FRONTPAGE,
  StreamType.MOBILE_WEB,
  StreamType.EMBED,
  StreamType.PICTURE,
];

// F-10: how long a type whose backup had ads (or announced its own break) is left out of the chain
export const CONTAMINATED_MS = 5000;
// F-14: how long after the last poll that listed it an ad URI is still answered with the blank segment (as Brave's script)
export const BLANK_TTL_MS = 120_000;
// E6, F-18: wait between pause and play at the break edges unless pausePlayDelayMs sets another; 1500 until soak d
// measured 0 against it (docs/findings/2026-10-08-pause-length.md)
export const PAUSE_PLAY_DELAY_MS = 0;
// F-19: at most one prewarm per this many ms (the page asks for a picture-by-picture master every 8 to 14 min, B-037)
export const PREWARM_MS = 60_000;

export class Player {
  integrityToken = ""; //the integrity token

  streamList: Stream[] = []; //the list of streams that are currently being played
  actualChannel: string = ""; //the channel
  playingAds = false; //if the stream is playing ads
  setting: Setting | undefined; //the settings
  quality: string = ""; //the quality of the stream
  freeStream: boolean = false; //if the stream is free
  private playerVariants = new Map<string, { stream: Stream; variant: StreamUrl }>(); //variant URL (without query) of the player's masters
  private pinnedType: string | null = null; // F-10: type of the last clean backup delivered
  private contaminatedUntil = new Map<string, number>(); // F-10: type -> time (ms) until which it is skipped
  private blankUris = new Map<string, number>(); // F-14: ad URI -> time (ms) of the last poll that listed it
  private lastPrewarm = -Infinity; // F-19: time (ms) of the last prewarm
  private pageSequence: SequenceReference | null = null; // F-23: newest live segment of the last page playlist without ads
  private sequenceShifts = new Map<string, number>(); // F-23: backup variant URL (without query) -> shift, for this break
  private source = MAIN_SOURCE; // F-24: where the playlist being built comes from: the page's, or a backup variant URL
  private delivered: { source: string; newest: number } | null = null; // F-24: the last playlist given to the player
  // F-15 (T-601): pause/play at the edges of a break (E6); with reloadAfterAd, a reload at its end
  private adBreak = new AdBreak({
    pauseAndPlay: () => this.edgePauseAndPlay(),
    reload: () => this.reload(),
    reloadAfterAd: () => this.setting?.reloadAfterAd === true,
  });

  constructor(private readonly scope: WorkerContext) {}

  getQuality = () => this.scope.postMessage({ type: "getQuality" });
  getSettings = () => this.scope.postMessage({ type: "getSettings" });
  pause = () => this.scope.postMessage({ type: "pause" });
  play = () => this.scope.postMessage({ type: "play" });
  // F-15: the page reloads the player and answers with reloadResult
  reload = () => {
    this.emit({ type: "reloadRequested" });
    this.scope.postMessage({ type: "reload" });
  };

  // F-19 (T-409): with prewarmBackups (default on since T-410), the page's picture-by-picture request, 3 to 14 s before
  // each stitched midroll (B-044), brings a token and master for the backup types, at most once every PREWARM_MS.
  // T-410: only the types with no stored master (none yet, or dropped when their backup failed or announced a break)
  prewarmBackups = () => {
    const stream = this.currentStream();
    if (this.setting?.prewarmBackups === false || !stream) return;
    const now = Date.now();
    if (now - this.lastPrewarm < PREWARM_MS) return;
    const types = this.backupPlayerTypes().filter((type) => !stream.getStreamByStreamType(type).length);
    if (!types.length) return;
    this.lastPrewarm = now;
    for (const type of types) stream.createStreamAccess(type, this.integrityToken, type === StreamType.AUTOPLAY ? "android" : "web");
    this.emit({ type: "backupsPrewarmed", count: types.length });
  };

  // F-22 (T-812): with prewarmAtLoad (default on), the page's usher request for a channel brings the same prewarm,
  // for midrolls announced in the first seconds of a load
  prewarmAtLoad = () => {
    if (this.setting?.prewarmAtLoad !== false) this.prewarmBackups();
  };

  // F-15: a reload the page could not do (no player found) falls back to pause/play (E6)
  onReloadResult = (ok: boolean) => {
    this.emit({ type: "playerReloaded", ok });
    if (!ok) this.pauseAndPlay();
  };

  setSettings = (setting: Setting) => {
    this.setting = setting;
    this.scope.logger("Settings loaded");
  };

  setIntegrityToken = (integrityToken: string) => this.integrityToken = integrityToken;

  pauseAndPlay = async () => {
    this.pause();
    const delay = this.pausePlayDelay();
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
    this.play();
    this.play();
  };

  // F-21 (T-809): E6 at the break edges only with pausePlayOnBreaks (default off since T-809, with F-23 on: its restart
  // left the player about 1 s of buffer); the reload fallback (F-15) is not one
  private edgePauseAndPlay = () => {
    if (this.setting?.pausePlayOnBreaks !== true) return;
    this.pauseAndPlay();
  };

  // F-18 (T-604): a number of ms from 0 up, else the default
  private pausePlayDelay = (): number => {
    const value = this.setting?.pausePlayDelayMs;
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : PAUSE_PLAY_DELAY_MS;
  };

  onStartAds = () => {
    this.scope.logger("ads started");
    this.edgePauseAndPlay();
  };
  onEndAds = () => {
    this.scope.logger("ads ended");
    this.edgePauseAndPlay();
  };

  isAds = (x: string, allowChange: boolean = false) => {
    const ads = this.hasAds(x);
    // const ads: boolean = Math.random() < 0;
    if (!allowChange) return ads;
    this.adBreak.poll(ads);
    this.playingAds = ads;

    return this.playingAds;
  }

  // some ads are not in the principal stream
  freeStreamChanged(x: boolean) {
    this.scope.logger("freeStreamChanged:", x);
    // call pause and play when changed
    if (this.freeStream != x) this.edgePauseAndPlay();
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
    this.source = MAIN_SOURCE;
    const out = await this.playlistFor(text, url);
    this.followSequence(out);
    return out;
  }

  // F-24 (T-818): the player asks for the number after the last segment it fetched. When the playlist it gets now comes
  // from another source than the last one and lists nothing up to that one's newest number (after a pre-roll the
  // page's playlist numbers from 0, B-029, while the backups number from the live sequence), it would wait for numbers
  // that do not come: with restartOnSequenceBack (default on) it is restarted, E6's pause and play, once
  private followSequence(text: string) {
    const newest = newestNumber(text);
    if (newest == null) return;
    const previous = this.delivered;
    this.delivered = { source: this.source, newest };
    if (!previous || previous.source === this.source || newest >= previous.newest) return;
    if (this.setting?.restartOnSequenceBack === false) return;
    this.scope.logger("sequence back", previous.newest, "->", newest);
    this.emit({ type: "sequenceRestart", count: previous.newest - newest });
    this.pauseAndPlay();
  }

  private async playlistFor(text: string, url: string): Promise<string> {
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
      this.pageSequence = sequenceReference(text) ?? this.pageSequence;
      if (this.setting?.stripFallback === false) return text;
      const announced = blankAds(text, [], url);
      if (!announced.uris.length) return text;
      this.listBlank(announced.uris, announced.uris.length);
      return this.adMarkers(announced.text);
    }
    // is ads and is the principal stream
    if (!this.isAds(text, true)) {
      this.scope.logger("Stream is free");
      this.freeStream = false;
      // F-23: the page's numbering outside breaks; inside a break the page's own numbers move (B-054)
      this.pageSequence = sequenceReference(text) ?? this.pageSequence;
      this.sequenceShifts.clear();
      return text;
    }
    this.emit({ type: "adDetected" });

    const dump: string[] = [];

    // F-09: the first backup without ads replaces the playlist (E4); a type without one gets a new token.
    // F-10: a type whose backup had ads is skipped for CONTAMINATED_MS, with no fetch and no token request.
    // F-25: at a switch of source, a clean backup that lists nothing past the player's newest number waits for the
    // types after it, and is used only when none of them is ahead
    // F-26: with parallelBackupFetch (default on), when the first type gives none, the other types' playlists are
    // asked at once and their answers taken in F-09's order (a preroll: each web type's backup has its own, B-052,
    // and one type after another took 0.44 s each, B-056)
    let behind: { type: string; variant?: StreamUrl; text: string; source: string } | null = null;
    const target = this.variantTarget(url);
    const types = this.backupPlayerTypes().filter((type) => (this.contaminatedUntil.get(type) ?? 0) <= Date.now());
    const rounds = this.setting?.parallelBackupFetch === false ? types.map((type) => [type]) : [types.slice(0, 1), types.slice(1)];
    for (const round of rounds) {
      const backups = await Promise.all(round.map((type) => this.fetchm3u8ByStreamType(type, target)));
      round.forEach((type, i) => this.noteBackup(type, backups[i], dump));
      for (const [i, type] of round.entries()) {
        const backup = backups[i];
        if (!backup.data) continue;
        const source = withoutQuery(backup.variant?.url ?? type);
        const aligned = this.alignSequence(backup.data, backup.variant, text);
        if (this.listsNothingNew(aligned, source)) {
          this.emit({ type: "backupBehind", playerType: type });
          behind ??= { type, variant: backup.variant, text: aligned, source };
          continue;
        }
        return this.useBackup(type, backup.variant, aligned, source);
      }
    }
    if (behind) return this.useBackup(behind.type, behind.variant, behind.text, behind.source);

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
    return this.adMarkers(blanked.text);
  }

  // F-20 (T-811): with stripAdMarkers (default on), a playlist Purple delivers with blanked ad segments or an announced
  // break loses the ad's DATERANGE lines, which the page's ad UI starts from
  private adMarkers = (text: string) => (this.setting?.stripAdMarkers === false ? text : stripAdDateranges(text));

  // F-09, F-10: what one type's answer leaves for the next polls: a new token when it gave no clean backup, the type
  // left out for CONTAMINATED_MS when its backups had ads; its playlists for the merge (E5)
  private noteBackup(type: string, backup: { data: string | null; dump: string[]; contaminated: boolean }, dump: string[]) {
    if (!backup.data) this.currentStream().createStreamAccess(type, this.integrityToken, type === StreamType.AUTOPLAY ? "android" : "web");
    if (backup.dump) dump.push(...backup.dump);
    if (backup.contaminated && !backup.data) this.contaminatedUntil.set(type, Date.now() + CONTAMINATED_MS);
  }

  private useBackup(type: string, variant: StreamUrl | undefined, text: string, source: string): string {
    // F-10: autoplay and picture-by-picture (360p) are never pinned (T-802: the next midroll started on the 360p master)
    if (type !== StreamType.AUTOPLAY && type !== StreamType.PICTURE) this.pinnedType = type;
    this.emit({ type: "backupUsed", playerType: type, quality: variant?.quality });
    this.source = source;
    return text;
  }

  // F-25 (T-820): with skipBackupBehind (default on), a playlist from another source than the last one given to the
  // player whose newest number is not past that one's: the player would wait for it to move (a backup token asked a
  // moment before was behind in time, soak j: 2 s still)
  private listsNothingNew(text: string, source: string): boolean {
    if (this.setting?.skipBackupBehind === false || !this.delivered || this.delivered.source === source) return false;
    const newest = newestNumber(text);
    return newest != null && newest <= this.delivered.newest;
  }

  // F-23 (T-817): with alignBackupSequence (default on), a backup replacing the page's playlist gets the numbers the page's playlist
  // gives the same date-time, from its last poll without ads (else the live segments before the ads of this one). The
  // shift is kept per backup variant for the break, so its numbers do not move between polls.
  private alignSequence(backup: string, variant: StreamUrl | undefined, main: string): string {
    if (this.setting?.alignBackupSequence === false) return backup;
    const key = withoutQuery(variant?.url ?? "");
    let shift = this.sequenceShifts.get(key);
    if (shift == null) {
      const reference = this.pageSequence ?? sequenceReference(main, true);
      const computed = reference ? sequenceShift(backup, reference) : null;
      if (computed == null) return backup;
      shift = computed;
      this.sequenceShifts.set(key, shift);
      if (shift) this.emit({ type: "sequenceShifted", count: shift });
    }
    return shiftSequence(backup, shift);
  }


  // F-09: the setting's list (default: DEFAULT_BACKUP_PLAYER_TYPES); autoplay only with lowQualityFallback (default on), last.
  // F-10: with pinBackupPlayerType (default on), the type of the last clean backup goes first.
  backupPlayerTypes(): string[] {
    const types = (this.setting?.backupPlayerTypes ?? DEFAULT_BACKUP_PLAYER_TYPES).filter((type) => type !== StreamType.AUTOPLAY);
    const pinned = this.setting?.pinBackupPlayerType !== false && this.pinnedType && types.includes(this.pinnedType) ? this.pinnedType : null;
    const ordered = pinned ? [pinned, ...types.filter((type) => type !== pinned)] : types;
    return this.setting?.lowQualityFallback === false ? ordered : [...ordered, StreamType.AUTOPLAY];
  }

  async fetchm3u8ByStreamType(accessType: StreamType | string, target: VariantTarget = { quality: this.quality }): Promise<{ data: string | null; dump: string[]; contaminated: boolean; variant?: StreamUrl }> {
    let dump: string[] = [];
    let data: string = "";
    let contaminated = false;
    let variant: StreamUrl | undefined;

    let servers: Server[] = this.currentStream().getStreamByStreamType(accessType);

    // do the all request in same time
    for (const server of servers) {
      //filter server url by quality or bestquality
      // T-407 (F-11): same quality and codec family as the player's variant
      const streamUrl = server.pick(target);

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
        variant = streamUrl;
        this.scope.logger("Stream Type: " + accessType + " - Free Stream");
        break;
      }

    }

    return { data: data, dump: dump, contaminated, variant };
  }

  // F-08 (T-404): the page's usher request for the current channel, reused by its backups
  setUsherUrl(url: string) {
    const stream = this.currentStream();
    if (stream) stream.usherUrl = url;
  }

  // Variants of a master the player requested: their media playlists are recognized by URL, whatever their path.
  setPlayerMaster(text: string) {
    for (const variant of parseVariants(text)) this.playerVariants.set(withoutQuery(variant.url), { stream: this.currentStream(), variant });
    // F-23: a new page token numbers the stream from its own base; F-24: a new player starts from its first playlist
    this.pageSequence = null;
    this.sequenceShifts.clear();
    this.delivered = null;
  }

  // T-407: the variant of the player's master a media playlist URL belongs to; else the quality the player reported
  variantTarget = (url: string): VariantTarget => this.playerVariants.get(withoutQuery(url))?.variant ?? { quality: this.quality };

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
// F-24: the source of a playlist built from the page's own (as Twitch sent it, edited, merged or blanked)
const MAIN_SOURCE = "page";
