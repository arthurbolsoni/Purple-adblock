import { Controller } from "./decorator/controller.decorator";
import { Fetch, Message } from "./decorator/handler.decorator";
import { setting } from "./modules/player/interface/setting.interface";
import { Player } from "./modules/player/player";

@Controller()
export class appController {
  getSettings = () => global.postMessage({ type: "getSettings" });

  constructor(private readonly appService: Player) {
    this.getSettings();
  }

  @Fetch("usher.ttvnw.net/api/channel/hls/", "picture-by-picture")
  async onChannel(url: string, options: any): Promise<Response> {
    const response: Response = await global.realFetch(url, options);
    if (!response.ok) {
      console.log("Error on channel load");
      return response;
    }

    const text = await response.text();
    await this.appService.onStartChannel(url);
    return new Response(text);
  }

  @Fetch("hls.ttvnw.net/v1/playlist/")
  async onFetch(url: string, options: any): Promise<Response> {
    const body: string = await (await realFetch(url, options)).text();
    const playlist = await this.appService.onfetch(url, body);
    return new Response(playlist as any);
  }

  @Fetch("picture-by-picture")
  async onChannelPicture(url: string, options: any): Promise<Response> {
    return new Response();
  }

  @Message("setSettings")
  async setSettings(data: any) {
    this.appService.settings = data.value;
  }

  @Message("setQuality")
  async setQuality(data: any) {
    this.appService.quality = data.value;
  }
}
