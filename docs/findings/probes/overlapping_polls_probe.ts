// Probe for docs/findings/2026-11-08-overlapping-polls-source.md (T-831): two polls of the page's playlist with ads
// through one Player, one after the other and overlapping. Each poll's frontpage backup answers when the probe says:
// poll A's clean (A gives the backup), poll B's with ads (B gives the page's playlist, blanked). Prints what each poll
// gave and the source Player recorded for the last one (`delivered`, read by F-24 and F-25 at the next poll).
//
// Since the fix (T-831) the polls take turns: B's backup request is made after A has given its playlist, so the probe
// waits for each request to exist before it answers it, and both orders record `page` for B.
//
//   bun docs/findings/probes/overlapping_polls_probe.ts
import { Player } from "../../../serviceWorker/src/modules/player/player";
import { StreamType } from "../../../serviceWorker/src/modules/stream/interface/stream.enum";

const LIVE = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:90
#EXT-X-PROGRAM-DATE-TIME:2026-10-03T12:00:00.000Z
#EXTINF:2.000,live
https://seg.example/live-90.ts
#EXT-X-PROGRAM-DATE-TIME:2026-10-03T12:00:02.000Z
#EXTINF:2.000,live
https://seg.example/live-91.ts
`;
const ADS = LIVE.replace("MEDIA-SEQUENCE:90", "MEDIA-SEQUENCE:100").replaceAll(",live", ",Amazon|AD-1").replaceAll("live-", "ad-");
const master = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=6000000,RESOLUTION=1920x1080,CODECS="avc1.64002A,mp4a.40.2",VIDEO="chunked",FRAME-RATE=60.000
https://video-weaver.example.hls.ttvnw.net/v1/playlist/frontpage-chunked.m3u8
`;

async function run(overlap: boolean) {
  const answers: ((body: string) => void)[] = []; // one per backup request, answered by the probe
  const player = new Player({
    logger: () => {},
    postMessage: () => {},
    request: (() => new Promise<Response>((resolve) => answers.push((body) => resolve(new Response(body))))) as any,
  } as any);
  player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [StreamType.FRONTPAGE], lowQualityFallback: false } as any);
  player.setChannel("channel");
  player.currentStream().setStreamAccess(master, StreamType.FRONTPAGE);
  player.currentStream().createStreamAccess = async () => {};
  const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
  const answer = async (i: number, body: string) => {
    while (!answers[i]) await tick();
    answers[i](body);
  };
  const gave = (text: string) => (text === LIVE ? "the backup" : "the page's, blanked");

  const a = player.onFetch(ADS);
  await tick();
  let b: Promise<string>;
  if (overlap) {
    b = player.onFetch(ADS); // poll B starts while A waits for its backup
    await tick();
    await answer(0, LIVE);
    const outA = await a;
    await answer(1, ADS);
    return { a: gave(outA), b: gave(await b), recordedForB: (player as any).delivered.source };
  }
  await answer(0, LIVE);
  const outA = await a;
  b = player.onFetch(ADS);
  await answer(1, ADS);
  return { a: gave(outA), b: gave(await b), recordedForB: (player as any).delivered.source };
}

for (const overlap of [false, true]) {
  const r = await run(overlap);
  console.log(`${overlap ? "overlapping" : "one after the other"}: A gave ${r.a}, B gave ${r.b}; recorded for B: ${r.recordedForB}`);
}
