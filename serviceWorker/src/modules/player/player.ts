import { Stream } from "../stream/stream";
import { Setting } from "./interface/setting.interface";
import { StreamType } from "../stream/interface/stream.enum";
import { Server } from "../stream/interface/stream.types";
import { Parser } from "m3u8-parser";

export class Player {
  integrityToken = ""; //the integrity token

  streamList: Stream[] = []; //the list of streams that are currently being played
  actualChannel: string = ""; //the channel
  playingAds = false; //if the stream is playing ads
  setting: Setting | undefined; //the settings
  quality: string = ""; //the quality of the stream
  freeStream: boolean = false; //if the stream is free

  getQuality = () => global.postMessage({ type: "getQuality" });
  getSettings = () => global.postMessage({ type: "getSettings" });
  pause = () => global.postMessage({ type: "pause" });
  play = () => global.postMessage({ type: "play" });

  setSettings = (setting: Setting) => {
    this.setting = setting;
    logPrint("Settings loaded");
  };

  setIntegrityToken = (integrityToken: string) => this.integrityToken = integrityToken;

  pauseAndPlay = async () => {
    this.pause();
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.play();
  };

  onStartAds = () => {
    console.log("ads started");
    this.pauseAndPlay();
  };
  onEndAds = () => {
    console.log("ads ended");
    this.pauseAndPlay();
  };

  isAds = (x: string, allowChange: boolean = false) => {
    const ads = this.hasAds(x);
    if (!allowChange) return ads;
    if (this.playingAds == false && this.playingAds != ads) this.onStartAds();
    if (this.playingAds == true && this.playingAds != ads) this.onEndAds();
    this.playingAds = ads;

    return this.playingAds;
  }

  freeStreamChanged(x: boolean) {
    // call pause and play when changed
    if (this.freeStream != x) this.pauseAndPlay();
    this.freeStream = x;
  }

  hasAds = (x: string) => x?.toString().includes("stitched") || x?.toString().includes("Amazon") || x?.toString().includes("DCM,");

  currentStream = (channel: string = this.actualChannel): Stream => {
    return this.streamList?.find((x: Stream) => x.channelName === channel)!;
  };

  isWhitelist(): boolean {
    return this.setting?.whitelist?.includes(this.actualChannel) || false;
  }

  async onFetch(text: string): Promise<string> {
    if (this.isWhitelist()) return text;
    // if (!this.isAds(text, true)) {
    //   this.freeStream = false;
    //   return this.mergeM3u8Contents([text]);
    // }

    // o fluxo de stream deve sempre ter 2 stream
    // deve também fazer a requisicao de uma nova stream caso a atual tenha ads, para que a proxima requisicao tenha stream para se basear
    // caso o fluxo for livre, nao deve fazer a requisicao, porem manter 2 fluxo de stream
    // mesmo com ads, o fluxo da stream deve ser enviado para o mergeM3u8Contents para que seguimentos sem ads sejam mesclados

    const dump: string[] = [];

    const frontpage = await this.fetchm3u8ByStreamType(StreamType.FRONTPAGE);
    if (!frontpage.data) this.currentStream().createStreamAccess(StreamType.FRONTPAGE, this.integrityToken);
    if (frontpage.dump) dump.push(...frontpage.dump);
    if (frontpage.data) return frontpage.data;

    const picture = await this.fetchm3u8ByStreamType(StreamType.PICTURE);
    if (!picture.data) this.currentStream().createStreamAccess(StreamType.PICTURE, this.integrityToken);
    if (picture.dump) dump.push(...picture.dump);
    if (picture.data) return picture.data;

    // if (dump?.length) {
    //   this.freeStreamChanged(true);
    // } else {
    //   this.freeStreamChanged(false);
    // }

    this.printViewAds([text, ...dump])

    return dump.length != 0 ? this.mergeM3u8Contents([JSON.parse(JSON.stringify(text)), ...dump]) : JSON.parse(JSON.stringify(text));
  }

  printViewAds(conteudosM3u8: string[]) {
    // should print the segment seconds and number with X for ads and V for no ads
    const manifestos = conteudosM3u8.map((conteudo) => {
      const analisador = new Parser();

      analisador.push(conteudo);
      analisador.end();

      // extract titles from #EXTINF tags in each segment
      const manifest = analisador.manifest as { targetDuration?: number; mediaSequence?: number; segments?: { uri: string; duration: number; title: string; dateTimeString: string }[] };
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

    let log = [];

    for (const manifesto of manifestos) {
      if (manifesto.segments) {
        manifesto.segments.forEach((segment: any) => {
          log.push(`${this.hasAds(segment.title) ? "X" : "V"}`);
        });
      }
    }

    console.log(log.join("-"));
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
      const manifest = analisador.manifest as { targetDuration?: number; mediaSequence?: number; segments?: { uri: string; duration: number; title: string; dateTimeString: string }[] };
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

    console.log("Segmentos encontrados no manifesto principal:", manifestoPrincipal?.segments?.length);
    console.log("Manifestos de suporte encontrados:", manifestosSuporte.length);

    let segmentRemoved = 0;
    let segmentRepleced = 0;

    if (!manifestoPrincipal.segments?.length) return this.generateM3u8(manifestoPrincipal);

    // Percorrer os segmentos do manifesto principal e preencher as lacunas com os segmentos do manifesto de suporte
    for (let i = 0; i < manifestoPrincipal.segments.length; i++) {
      const segmentoPrincipal = manifestoPrincipal.segments[i];

      let isChanged = false;

      if (this.hasAds(segmentoPrincipal.title)) {
        manifestosSuporte.forEach((manifestoSuporte) => {
          // Encontre o primeiro segmento de suporte que NÃO contenha o título "Amazon" e tenha um tempo semelhante ao segmentoPrincipal (ignorando milissegundos)
          const segmentoSuporte = manifestoSuporte?.segments?.find((seg: any) => {
            if (this.hasAds(seg.title)) return false;

            const dataPrincipal = new Date(segmentoPrincipal.dateTimeString);
            const dataSuporte = new Date(seg.dateTimeString);
            dataPrincipal.setMilliseconds(0);
            dataSuporte.setMilliseconds(0);

            return dataPrincipal.getTime() === dataSuporte.getTime();
          });

          if (segmentoSuporte && manifestoPrincipal.segments?.[i]) {
            // Substitua o segmento principal pelo segmento de suporte
            manifestoPrincipal.segments[i] = segmentoSuporte;
            isChanged = true;
          }
        });

        // Se o segmento principal ainda contiver o título "Amazon", remova-o
        // if (!isChanged) {
        //   manifestoPrincipal.segments.splice(i, 1);
        //   segmentRemoved++;
        // }

        if (isChanged) {
          segmentRepleced++;
        }
      }
    }

    console.log("Segmento com ads removidos:", segmentRemoved);
    console.log("Segmento com ads substituídos:", segmentRepleced);

    // Criar uma nova lista de reprodução M3U8 com os segmentos mesclados
    const conteudoM3u8Mesclado = this.generateM3u8(manifestoPrincipal);
    // console.log("Conteúdo M3U8 mesclado:", conteudoM3u8Mesclado);
    return conteudoM3u8Mesclado;
  }

  async fetchm3u8ByStreamType(accessType: StreamType): Promise<{ data: string | null; dump: string[] }> {
    let dump: string[] = [];
    let data: string = "";

    let servers: Server[] = this.currentStream().getStreamByStreamType(accessType);

    // FAZER AS REQUISICOES TODAS AO MESMO TEMPO
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
      } else {
        data = text;
        logPrint("Stream Type: " + accessType + " - Free Stream");
        break;
      }

    }

    return { data: data, dump: dump };
  }

  setChannel(channelName: string) {
    logPrint("Loading channel", channelName);
    this.actualChannel = channelName;

    let currentStream = this.streamList.find((stream) => stream.channelName === channelName);
    if (!currentStream) {
      currentStream = new Stream(channelName);
      this.streamList.push(currentStream);
    }
  }
}