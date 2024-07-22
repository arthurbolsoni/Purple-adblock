import { Parser } from "m3u8-parser";

type Segment = { uri: string; duration: number; title: string; dateTimeString: string };
type Manifest = { targetDuration?: number; mediaSequence?: number; segments?: Segment[] };

const hasAds = (x: string) => x?.toString().includes("stitched") || x?.toString().includes("Amazon") || x?.toString().includes("DCM,");

export function printViewAds(conteudosM3u8: string[]) {
  const manifestos = conteudosM3u8.map((conteudo) => {
    const analisador = new Parser();
    analisador.push(conteudo);
    analisador.end();

    const manifest = analisador.manifest as { targetDuration?: number; mediaSequence?: number; segments?: { uri: string; duration: number; title: string; dateTimeString: string }[] };
    if (manifest.segments) {
      manifest.segments.forEach((segment) => {
        const extinfTagRegex = new RegExp(`#EXTINF:([0-9.]*)?,?(.*)(?:\n|\r\n)${segment.uri}`);
        const match = conteudo.match(extinfTagRegex);
        if (match) {
          segment.title = match[2] ? match[2].trim() : "";
        }
      });
    }
    return manifest;
  });

  let log: string[] = [];
  for (const manifesto of manifestos) {
    if (manifesto.segments) {
      manifesto.segments.forEach((segment) => {
        log.push(`${hasAds(segment.title) ? "X" : "V"}`);
      });
    }
  }
  console.log(log.join("-"));
}

export function generateM3u8(manifest: Manifest): string {
  let m3u8Content = `#EXTM3U\n`;

  m3u8Content += `#EXT-X-TARGETDURATION:${manifest.targetDuration ?? 5}\n`;

  m3u8Content += `#EXT-X-MEDIA-SEQUENCE:${manifest.mediaSequence ?? 0}\n`;

  if (manifest.segments) {
    manifest.segments.forEach((segment) => {
      if (segment.duration) {
        m3u8Content += `#EXTINF:${segment.duration}\n`;
      }
      m3u8Content += `${segment.uri}\n`;
    });
  }

  return m3u8Content;
}

export function mergeM3u8Contents(conteudosM3u8: string[]): string {
  if (!conteudosM3u8.length) return "";
  // printViewAds(conteudosM3u8);

  const manifestos: Manifest[] = conteudosM3u8.map((conteudo) => {
    const analisador = new Parser();
    analisador.push(conteudo);
    analisador.end();

    const manifest = analisador.manifest as { targetDuration?: number; mediaSequence?: number; segments?: { uri: string; duration: number; title: string; dateTimeString: string }[] };
    if (manifest.segments) {
      manifest.segments.forEach((segment) => {
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
  let segmentReplaced = 0;

  if (!manifestoPrincipal.segments?.length) return generateM3u8(manifestoPrincipal);

  for (let i = 0; i < manifestoPrincipal.segments.length; i++) {
    const segmentoPrincipal = manifestoPrincipal.segments[i];
    let isChanged = false;

    console.log(segmentoPrincipal.title);

    if (hasAds(segmentoPrincipal.title)) {
      for (const manifestoSuporte of manifestosSuporte) {
        const segmentoSuporte = manifestoSuporte?.segments?.find((seg) => {
          if (hasAds(seg.title)) return false;

          const dataPrincipal = new Date(segmentoPrincipal.dateTimeString);
          const dataSuporte = new Date(seg.dateTimeString);
          dataPrincipal.setMilliseconds(0);
          dataSuporte.setMilliseconds(0);

          return dataPrincipal.getTime() === dataSuporte.getTime();
        });

        if (segmentoSuporte) {
          manifestoPrincipal.segments[i] = segmentoSuporte;
          isChanged = true;
          break;
        }
      }

      if (isChanged) {
        segmentReplaced++;
      }
    }
  }

  console.log("Segmento com ads removidos:", segmentRemoved);
  console.log("Segmento com ads substituídos:", segmentReplaced);

  return generateM3u8(manifestoPrincipal);
}
