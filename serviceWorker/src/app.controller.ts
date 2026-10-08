import { Controller } from "./decorator/controller.decorator";
import { Fetch, Message } from "./decorator/handler.decorator";
import { Player } from "./modules/player/player";
import { blankSegment } from "./modules/player/blank-segment";
import { StreamType } from "./modules/stream/interface/stream.enum";
import type { WorkerContext } from "./scope";
import { urlOf } from "./url";

// /api/channel/hls/<channel>.m3u8 or /api/v2/channel/hls/<channel>.m3u8; the query string is ignored
const channelFromUsher = (url: string) => decodeURIComponent(new URL(url).pathname.split("/").pop()!.replace(/\.m3u8$/, ""));

@Controller()
export class AppController {
  getSettings = () => this.scope.postMessage({ type: "getSettings" });

  constructor(
    private readonly appService: Player,
    private readonly scope: WorkerContext,
  ) {
    this.getSettings();
  }

  @Message("setIntegrity")
  async setIntegrity(data: any) {
    this.appService.setIntegrityToken(JSON.parse(data.value).token);
  }

  // T-401 (F-05): headers of the page's GQL requests; a Client-Integrity among them is the newest integrity token
  @Message("setGqlHeaders")
  async setGqlHeaders(data: any) {
    const headers: Record<string, string> = data?.value ?? {};
    this.scope.gqlHeaders = headers;
    if (headers["Client-Integrity"]) this.appService.setIntegrityToken(headers["Client-Integrity"]);
  }

  // F-14 (T-502): an ad segment the player was left with gets the blank segment; the request never reaches Twitch
  @Fetch(function (this: AppController, url: string) {
    return this.appService.isBlankSegment(url);
  })
  async onBlankSegment(): Promise<Response> {
    return blankSegment();
  }

  @Fetch("usher.ttvnw.net/api/channel/hls/", "picture-by-picture")
  @Fetch("usher.ttvnw.net/api/v2/channel/hls/", "picture-by-picture")
  async onChannel(input: any, options: any): Promise<Response> {
    const response: Response = await this.scope.request(input, options);
    if (!response.ok) {
      this.scope.logger("Error on channel load", response.status);
      return response;
    }

    const text = await response.text();

    await this.appService.setChannel(channelFromUsher(urlOf(input)));
    this.appService.setUsherUrl(urlOf(input));
    this.appService.setPlayerMaster(text);
    return new Response(text);
  }

  @Fetch("ttvnw.net/v1/playlist/")
  @Fetch(function (this: AppController, url: string) {
    return this.appService.isPlayerPlaylist(url);
  })
  async onFetch(input: any, options: any): Promise<Response> {
    const body: string = await (await this.scope.request(input, options)).text();
    try {
      return new Response(await this.appService.onFetch(body, urlOf(input)));
    } catch (e) {
      // a failure in the blocking logic must not stop the player: it gets Twitch's playlist
      this.scope.logger(e);
      return new Response(body);
    }
  }

  @Fetch("picture-by-picture")
  async onChannelPicture(input: any, options: any): Promise<Response> {
    const response: Response = await this.scope.request(input, options);
    if (!response.ok) {
      this.scope.logger("Error on picture-by-picture load", response.status);
      return response;
    }

    const text = await response.text();

    await this.appService.currentStream().setStreamAccess(text, StreamType.PICTURE);
    this.scope.logger("picture-by-picture master stored");
    return new Response();
  }

  // T-602: the player keeps the message's value, the stored settings (C-10); every message replaces them whole
  @Message("setSettings")
  async setSettings(data: any) {
    this.scope.debug = data?.value?.debug === true;
    this.appService.setSettings(data?.value ?? {});
  }

  @Message("setQuality")
  async setQuality(data: any) {
    this.appService.quality = data.value;
  }
}
