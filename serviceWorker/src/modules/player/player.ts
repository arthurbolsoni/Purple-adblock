import { Stream } from "../stream/stream";
import { Setting } from "./interface/setting.interface";
import { StreamType } from "../stream/interface/stream.enum";
import { Server } from "../stream/interface/stream.types";
import { Parser } from "m3u8-parser";

export class Player {
  streamList: Stream[] = []; //the list of streams that are currently being played
  actualChannel: string = ""; //the channel
  playingAds = false; //if the stream is playing ads
  setting: Setting | undefined; //the settings
  quality: string = ""; //the quality of the stream

  getQuality = () => global.postMessage({ type: "getQuality" });
  getSettings = () => global.postMessage({ type: "getSettings" });
  pause = () => global.postMessage({ type: "pause" });
  play = () => global.postMessage({ type: "play" });

  setSettings = (setting: Setting) => {
    this.setting = setting;
    if (this.setting?.toggleProxy && this.setting?.proxyUrl) this.currentStream()?.tunnelList?.push(this.setting?.proxyUrl);
    logPrint("Settings loaded");
  };

  pauseAndPlay = () => {
    this.pause();
    this.play();
  };
  onStartAds = () => {
    console.log("ads started");
    this.pauseAndPlay();
    this.pauseAndPlay();
  };
  onEndAds = () => {
    console.log("ads ended");
    this.pauseAndPlay();
    this.pauseAndPlay();
  };

  isAds = (x: string, allowChange: boolean = false) => {
    // const ads = x.toString().includes("stitched-ad") || x.toString().includes("twitch-client-ad") || x.toString().includes("twitch-ad-quartile");
    const ads = x?.toString().includes("stitched") || x?.toString().includes("Amazon") || x?.toString().includes("DCM");
    if (!allowChange) return ads;
    if (this.playingAds == false && this.playingAds != ads) this.onStartAds();
    if (this.playingAds == true && this.playingAds != ads) this.onEndAds();
    this.playingAds = ads;

    return this.playingAds;
  };

  currentStream = (channel: string = this.actualChannel): Stream => {
    return this.streamList?.find((x: Stream) => x.channelName === channel)!;
  };

  isWhitelist(): boolean {
    return this.setting?.whitelist?.includes(this.actualChannel) || false;
  }

  async onFetch(text: string): Promise<string> {
    if (this.isWhitelist()) return text;
    if (!this.isAds(text, true)) return this.mergeM3u8Contents([text]);

    let dump: string[] = [];
    this.currentStream().createStreamAccess(StreamType.FRONTPAGE);
    this.currentStream().createStreamAccess(StreamType.SITE);

    const frontpage = await this.fetchm3u8ByStreamType(StreamType.FRONTPAGE);
    // if (frontpage.data) return this.mergeM3u8Contents([frontpage.data, ...dump]);
    dump = dump.concat(frontpage.dump);

    const external = await this.fetchm3u8ByStreamType(StreamType.EXTERNAL);
    // if (external.data) return this.mergeM3u8Contents([external.data, ...dump]);
    dump = dump.concat(external.dump);

    console.log("All stream types failed");

    return this.mergeM3u8Contents([text, ...dump]);
  }

  generateM3u8(manifest: any): string {
    let m3u8Content = `#EXTM3U\n`;

    if (manifest.targetDuration) {
      m3u8Content += `#EXT-X-TARGETDURATION:${manifest.targetDuration}\n`;
    }

    if (manifest.mediaSequence) {
      m3u8Content += `#EXT-X-MEDIA-SEQUENCE:${manifest.mediaSequence}\n`;
    }

    if (manifest.segments) {
      manifest.segments.forEach((segment: any) => {
        if (segment.duration) {
          m3u8Content += `#EXTINF:${segment.duration}`;
          m3u8Content += `\n`;
        }
        m3u8Content += `${segment.uri}\n`;
      });
    }

    return m3u8Content;
  }

  mergeM3u8Contents(conteudosM3u8: string[]): string {
    const manifestos = conteudosM3u8.map((conteudo) => {
      const analisador = new Parser();

      analisador.push(conteudo);
      analisador.end();

      // extract titles from #EXTINF tags in each segment
      const manifest = analisador.manifest;
      if (manifest.segments) {
        manifest.segments.forEach((segment: any) => {
          // Find the #EXTINF tag associated with the current segment
          const extinfTagRegex = new RegExp(`#EXTINF:([0-9.]*)?,?(.*)(?:\n|\r\n)${segment.uri}`);
          const match = conteudo.match(extinfTagRegex);

          if (match) {
            segment.title = match[2] ? match[2].trim() : "";
          }
        });
      }

      return manifest;
    });

    const manifestoPrincipal = manifestos[0];
    const manifestosSuporte = manifestos.slice(1);

    if (manifestoPrincipal.segments) {
      console.log("Segmentos encontrados no manifesto principal:", manifestoPrincipal.segments.length);
      console.log("Manifestos de suporte encontrados:", manifestosSuporte.length);

      // Percorrer os segmentos do manifesto principal e preencher as lacunas com os segmentos do manifesto de suporte
      for (let i = 0; i < manifestoPrincipal.segments.length; i++) {
        const segmentoPrincipal = manifestoPrincipal.segments[i];
        const hasAmazon =
          segmentoPrincipal.title && (segmentoPrincipal.title.includes("Amazon") || segmentoPrincipal.title.includes("DCM"));

        if (hasAmazon) {
          manifestosSuporte.forEach((manifestoSuporte) => {
            if (manifestoSuporte.segments) {
              // Encontre o primeiro segmento de suporte que NÃO contenha o título "Amazon" e tenha um tempo semelhante ao segmentoPrincipal (ignorando milissegundos)
              const segmentoSuporte = manifestoSuporte.segments.find((seg: any) => {
                if (!seg.title.includes("Amazon") && seg.title.includes("DCM")) {
                  return false;
                }

                const dataPrincipal = new Date(segmentoPrincipal.dateTimeString);
                const dataSuporte = new Date(seg.dateTimeString);
                dataPrincipal.setMilliseconds(0);
                dataSuporte.setMilliseconds(0);

                return dataPrincipal.getTime() === dataSuporte.getTime();
              });

              console.log("Segmento suporte encontrado:", segmentoSuporte);

              if (segmentoSuporte) {
                // Substitua o segmento principal pelo segmento de suporte
                manifestoPrincipal.segments[i] = segmentoSuporte;
              }
            }
          });

          manifestoPrincipal.segments.splice(i, 1);
          i--;
          console.log("Segmento principal removido:", segmentoPrincipal);
        }
      }
    }

    // Criar uma nova lista de reprodução M3U8 com os segmentos mesclados
    const conteudoM3u8Mesclado = this.generateM3u8(manifestoPrincipal);
    // console.log("Conteúdo M3U8 mesclado:", conteudoM3u8Mesclado);
    return conteudoM3u8Mesclado;
  }

  async fetchm3u8ByStreamType(accessType: StreamType): Promise<{ data: string | null; dump: string[] }> {
    logPrint("Stream Type: " + accessType);

    let dump: string[] = [];
    let servers: Server[] = this.currentStream().getStreamByStreamType(accessType);

    for (const server of servers) {
      //filter server url by quality or bestquality
      const streamUrl = server.findByQuality(this.quality) || server.bestQuality();

      //try get m3u8 content and return if don't have ads.
      const text: string = await (await global.request(streamUrl?.url)).text();
      dump.push(text);
      if (this.isAds(text)) {
        logPrint("Stream Type: " + accessType + " - Ads found");
        this.currentStream().removeServer(server);
        continue;
      }

      return { data: text, dump: dump };
    }

    return { data: null, dump: dump };
  }

  setChannel(channelName: string) {
    logPrint("Loading channel", channelName);
    this.actualChannel = channelName;

    const currentStream = new Stream(this.actualChannel);
    this.streamList.push(currentStream);
  }
}