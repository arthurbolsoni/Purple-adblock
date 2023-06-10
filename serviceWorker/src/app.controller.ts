import { Controller } from "./decorator/controller.decorator";
import { Fetch, Message } from "./decorator/handler.decorator";
import { Player } from "./modules/player/player";

@Controller()
export class AppController {
  getSettings = () => global.postMessage({ type: "getSettings" });

  constructor(private readonly appService: Player) {
    this.getSettings();
  }

  @Message("setIntegrity")
  async setIntegrity(data: any) {
    this.appService.setIntegrityToken(JSON.parse(data.value).token);
  }

  @Fetch("usher.ttvnw.net/api/channel/hls/", "picture-by-picture")
  async onChannel(url: string, options: any): Promise<Response> {
    const response: Response = await global.request(url, options);
    if (!response.ok) {
      console.log("Error on channel load");
      return response;
    }

    const text = await response.text();
    const channelName = /hls\/(.*).m3u8/gm.exec(url) || [];

    await this.appService.setChannel(channelName[1]);
    return new Response(text);
  }

  @Fetch("hls.ttvnw.net/v1/playlist/")
  async onFetch(url: string, options: any): Promise<Response> {
    const body: string = await (await request(url, options)).text();
    const playlist = await this.appService.onFetch(body);
    return new Response(playlist);
  }

  @Fetch("picture-by-picture")
  async onChannelPicture(url: string, options: any): Promise<Response> {
    return new Response();
  }

  @Message("setSettings")
  async setSettings(data: any) {
    this.appService.setSettings(data);
  }

  @Message("setQuality")
  async setQuality(data: any) {
    this.appService.quality = data.value;
  }
}
