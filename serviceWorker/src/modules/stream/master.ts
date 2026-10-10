import { Parser } from "m3u8-parser";
import { StreamUrl } from "./interface/stream.types";

// Purple 2.6.7's variant regex: an EXT-X-MEDIA NAME followed by a `https://video…` URL. Kept as a fallback for
// masters the parser reads no variant from.
const LEGACY_VARIANT = /NAME="((?:\S+\s+\S+|\S+))",AUTO(?:^|\S+\s+)(?:^|\S+\s+)(https:\/\/video(\S+).m3u8)/g;

// Variants of a master playlist. Quality: the EXT-X-MEDIA NAME of the variant's VIDEO group (v1 masters), else
// IVS-NAME or STABLE-VARIANT-ID (the page's v2 master has no EXT-X-MEDIA), else the group id.
export function parseVariants(text: string): StreamUrl[] {
  const parser = new Parser();
  parser.push(text);
  parser.end();

  const groups = parser.manifest.mediaGroups?.VIDEO ?? {};
  const variants: StreamUrl[] = (parser.manifest.playlists ?? [])
    .filter((playlist: any) => playlist.uri)
    .map((playlist: any) => {
      const attributes = playlist.attributes ?? {};
      const group = attributes.VIDEO && groups[attributes.VIDEO];
      const name = group ? Object.keys(group)[0] : undefined;
      return new StreamUrl({
        quality: name ?? attributes["IVS-NAME"] ?? attributes["STABLE-VARIANT-ID"] ?? attributes.VIDEO ?? "",
        resolution: attributes.RESOLUTION ? `${attributes.RESOLUTION.width}x${attributes.RESOLUTION.height}` : "",
        codecs: attributes.CODECS ?? "",
        bandwidth: attributes.BANDWIDTH ?? 0,
        url: playlist.uri,
      });
    });
  if (variants.length) return variants;

  return [...text.matchAll(LEGACY_VARIANT)].map((match) => new StreamUrl({ quality: match[1], url: match[2] }));
}
