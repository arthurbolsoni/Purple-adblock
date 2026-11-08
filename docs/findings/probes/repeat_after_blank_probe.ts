// Probe for docs/findings/2026-11-08-repeat-after-blanked-playlist.md (T-832): a break whose last playlists before the
// page's renumbered one (B-054) were the page's own, blanked (F-14) or merged (E5). Drives Player.onFetch with
// generated playlists and a player that asks for the number after the last one it fetched, and prints, per poll, the
// newest number Purple gives, whether it restarted the player (pause and play), and the live segment under each
// number the player fetches ("AGAIN": one at or behind the newest live segment it already has).
//
//   bun docs/findings/probes/repeat_after_blank_probe.ts
import { Player } from "../../../serviceWorker/src/modules/player/player";
import { StreamType } from "../../../serviceWorker/src/modules/stream/interface/stream.enum";
import { readSegments } from "../../../serviceWorker/src/modules/player/segments";
import { newestNumber } from "../../../serviceWorker/src/modules/player/sequence";

const T0 = Date.parse("2026-11-08T00:00:00.000Z");
const MAIN = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/main.m3u8";
const FRONTPAGE = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/frontpage-chunked.m3u8";

// 8 segments ending at live number `edge`; MEDIA-SEQUENCE = live number + `ahead`; `ads`: live numbers that are ad
// segments, under a twitch-stitched-ad DATERANGE as in the page's playlist during a break (B-034)
const playlist = (edge: number, ahead = 0, ads: number[] = []) => {
  const first = edge - 7;
  const lines = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-TARGETDURATION:6", `#EXT-X-MEDIA-SEQUENCE:${first + ahead}`, `#EXT-X-TWITCH-LIVE-SEQUENCE:${first}`];
  if (ads.length) {
    const start = new Date(T0 + Math.min(...ads) * 2000).toISOString();
    lines.push(`#EXT-X-DATERANGE:ID="stitched-ad-1",CLASS="twitch-stitched-ad",START-DATE="${start}",DURATION=${(ads.length * 2).toFixed(3)}`);
  }
  for (let n = first; n <= edge; n++) {
    const ad = ads.includes(n);
    lines.push(`#EXT-X-PROGRAM-DATE-TIME:${new Date(T0 + n * 2000).toISOString()}`, `#EXTINF:2.000,${ad ? "Amazon|AD" : "live"}`, `https://seg.example/${ad ? "ad" : "live"}-${n}.ts`);
  }
  return lines.join("\n");
};
const master = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=6000000,RESOLUTION=1920x1080,CODECS="avc1.64002A,mp4a.40.2",VIDEO="chunked",FRAME-RATE=60.000
${FRONTPAGE}
`;

// the live number of the segment a playlist lists under `number` (from its URI), or null for an ad or a blanked one
function contentAt(text: string, number: number, player: Player): number | null {
  const lines = text.split("\n");
  const first = Number(/#EXT-X-MEDIA-SEQUENCE:(\d+)/.exec(text)![1]);
  const segment = readSegments(lines)[number - first];
  const uri = segment ? lines[segment.uri].trim() : "";
  const live = /\/live-(\d+)\.ts$/.exec(uri);
  return live && !player.isBlankSegment(uri) ? Number(live[1]) : null;
}

async function run(title: string, polls: { label: string; page: string; backup: string; ms: number }[]) {
  console.log(`\n${title}`);
  let now = T0 + 1_000_000;
  Date.now = () => now;
  let answer = "";
  const posted: string[] = [];
  const player = new Player({
    logger: () => {},
    postMessage: (m: any) => posted.push(m.type),
    request: (async (url: string) => new Response(url === FRONTPAGE ? answer : "")) as any,
  } as any);
  player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [StreamType.FRONTPAGE], lowQualityFallback: false } as any);
  player.setChannel("channel");
  const stream = player.currentStream();
  stream.setStreamAccess(master, StreamType.FRONTPAGE);
  // a new token brings the frontpage master back (Purple drops a server whose playlist had ads)
  stream.createStreamAccess = (async () => stream.setStreamAccess(master, StreamType.FRONTPAGE)) as any;

  let have = -1; // the last number the player fetched
  let haveLive = -1; // the newest live segment on its timeline
  for (const poll of polls) {
    now += poll.ms;
    answer = poll.backup;
    const before = posted.length;
    const out = await player.onFetch(poll.page, MAIN);
    const restarted = posted.slice(before).includes("pause");
    const newest = newestNumber(out)!;
    const fetched: string[] = [];
    if (restarted || have < 0) {
      have = newest;
      haveLive = contentAt(out, newest, player) ?? haveLive;
    } else {
      for (let n = have + 1; n <= newest; n++) {
        const live = contentAt(out, n, player);
        fetched.push(live == null ? `${n}: blank` : `${n}: live ${live}${live <= haveLive ? " AGAIN" : ""}`);
        if (live != null && live > haveLive) haveLive = live;
      }
      have = newest;
    }
    console.log(`  ${poll.label.padEnd(44)} gives ${String(newest).padStart(3)} ${restarted ? "RESTART" : "       "} ${fetched.join(", ")}`);
  }
}

// the page's playlist numbers the live segments as the backups do until the break is over, then 4 further ahead
const after = playlist(110, 4);

await run("blanked: the frontpage backup with ads at the same times", [
  { label: "page, no ads (live 96-103)", page: playlist(103), backup: "", ms: 2000 },
  { label: "break; backup with ads: page blanked", page: playlist(105, 0, [104, 105]), backup: playlist(105, 0, [104, 105]), ms: 2000 },
  { label: "clean backup", page: playlist(106, 0, [104, 105, 106]), backup: playlist(106), ms: 6000 },
  { label: "backup with ads: page merged and blanked", page: playlist(108, 0, [104, 105, 106, 107, 108]), backup: playlist(108, 0, [107, 108]), ms: 6000 },
  { label: "break over, page 4 further ahead (B-054)", page: after, backup: "", ms: 2000 },
]);

await run("merged: the frontpage backup announces its own break (an earlier ad), its live segments replace the page's ads", [
  { label: "page, no ads (live 96-103)", page: playlist(103), backup: "", ms: 2000 },
  { label: "break; backup unclean: page merged", page: playlist(105, 0, [104, 105]), backup: playlist(105, 0, [98]), ms: 6000 },
  { label: "backup unclean: page merged", page: playlist(107, 0, [104, 105, 106, 107]), backup: playlist(107, 0, [100]), ms: 6000 },
  { label: "break over, page 4 further ahead (B-054)", page: after, backup: "", ms: 2000 },
]);
