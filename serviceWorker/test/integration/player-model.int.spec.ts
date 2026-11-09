// T-010: the real Player and Stream against the Quint model (test/model/player.qnt). Each trace in
// test/model/traces/player.json (`bun run model:traces player`) is replayed step by step: the playlists Twitch would
// serve are built from the model's state, each backup playlist answers its poll in the model's order, and each token
// request (GQL, then usher) ends when the model says, with a master whose variant URL is that token's. After each step
// what Player gave and recorded, its frontpage server and token request, and what a player asking for the number after
// its last one fetched must be what the model says.
import { afterEach, describe, expect, jest, spyOn, test } from "bun:test";
import { Player } from "../../src/modules/player/player";
import { StreamType } from "../../src/modules/stream/interface/stream.enum";
import { readSegments } from "../../src/modules/player/segments";
import { liveNumberAt, newestNumber } from "../../src/modules/player/sequence";
import traces from "../model/traces/player.json";

const W = 14; // player.qnt
const NONE = -1;
const T0 = Date.parse("2026-11-08T00:00:00.000Z");
const MAIN = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/main.m3u8";
// each token's master has its own variant URL, as Twitch's do
const variant = (token: number) => `https://video-weaver.example.hls.ttvnw.net/v1/playlist/frontpage-${token}.m3u8`;
const tokenOf = (url: string) => Number(/frontpage-(\d+)\.m3u8/.exec(url)?.[1] ?? NONE);
const master = (token: number) => `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=6000000,RESOLUTION=1920x1080,CODECS="avc1.64002A,mp4a.40.2",VIDEO="chunked",FRAME-RATE=60.000
${variant(token)}
`;

// one state of a trace, as quint.ts writes it
type State = [
  action: string,
  poll: number,
  answer: string,
  now: number,
  live: number,
  pageAhead: number,
  adStart: number,
  inFlight: number[],
  delivered: [newest: number, recorded: number, restart: number, newestLive: number, held: number] | 0,
  player: [have: number, haveLive: number, repeated: number, waiting: number, missed: number],
  token: [id: number, lag: number, offset: number],
  server: number,
  tokenPending: number,
];

// W segments ending at live number `edge`, MEDIA-SEQUENCE `ahead` past the live numbers; `ad(live)`: an ad segment.
// The page's ads come under a twitch-stitched-ad DATERANGE from `adStart` (B-034).
function playlist(edge: number, ahead: number, ad: (live: number) => boolean, adStart = NONE) {
  const first = edge - W + 1;
  const lines = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-TARGETDURATION:6", `#EXT-X-MEDIA-SEQUENCE:${first + ahead}`, `#EXT-X-TWITCH-LIVE-SEQUENCE:${first}`];
  if (adStart !== NONE) lines.push(`#EXT-X-DATERANGE:ID="stitched-ad-${adStart}",CLASS="twitch-stitched-ad",START-DATE="${new Date(T0 + adStart * 2000).toISOString()}",DURATION=${((edge - adStart + 1) * 2).toFixed(3)}`);
  for (let live = first; live <= edge; live++) {
    const isAd = ad(live);
    lines.push(`#EXT-X-PROGRAM-DATE-TIME:${new Date(T0 + live * 2000).toISOString()}`, `#EXTINF:2.000,${isAd ? "Amazon|AD" : "live"}`, `https://seg.example/${isAd ? "ad" : "live"}-${live}.ts`);
  }
  return lines.join("\n");
}

const pageText = (s: State) => {
  const [, , , , live, ahead, adStart] = s;
  const ads = adStart !== NONE && adStart <= live;
  return playlist(live, ahead, (l) => ads && l >= adStart, ads ? adStart : NONE);
};

// a token's playlist, `lag` behind and numbered `offset` past the live numbers; "adsSame": ads where the page has
// them; "adsEarlier": its oldest segment is an ad (its own break, F-10)
const backupText = (s: State, token: { lag: number; offset: number }) => {
  const [, , answer, , live, , adStart] = s;
  const edge = live - token.lag;
  return playlist(edge, token.offset, (l) => (answer === "adsSame" && adStart !== NONE && l >= adStart) || (answer === "adsEarlier" && l === edge - W + 1));
};

// the live segment a playlist lists under `number` (from its URI), or -1 for an ad or a blank one
function contentAt(text: string, number: number): number {
  const lines = text.split("\n");
  const first = Number(/#EXT-X-MEDIA-SEQUENCE:(\d+)/.exec(text)![1]);
  const segment = readSegments(lines)[number - first];
  const live = segment ? /\/live-(\d+)\.ts$/.exec(lines[segment.uri]) : null;
  return live ? Number(live[1]) : NONE;
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Player and Stream against the Quint model (T-010)", () => {
  for (const trace of traces as { name: string; states: State[] }[]) {
    test(trace.name, async () => {
      let now = trace.states[0][3];
      spyOn(Date, "now").mockImplementation(() => now);
      const posted: string[] = [];
      // the requests Player and Stream make, answered when the model says
      let asked: { url: string; answer: (text: string) => void } | null = null; // a backup playlist
      const gql: ((text: string) => void)[] = []; // token requests (PlaybackAccessToken) not answered yet
      let comingToken = NONE; // the token the usher request gets the master of
      const request = async (url: string) => {
        if (url.startsWith("https://gql.twitch.tv/")) return new Response(await new Promise<string>((resolve) => gql.push(resolve)));
        if (url.startsWith("https://usher.ttvnw.net/")) return new Response(master(comingToken));
        return new Response(await new Promise<string>((resolve) => (asked = { url, answer: resolve })));
      };
      const player = new Player({ logger: () => {}, postMessage: (message: any) => posted.push(message.type), request } as any);
      player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [StreamType.FRONTPAGE], lowQualityFallback: false } as any);
      player.setChannel("channel");
      const stream = player.currentStream();
      stream.setStreamAccess(master(1), StreamType.FRONTPAGE);
      const tokens = new Map<number, { lag: number; offset: number }>([[1, { lag: trace.states[0][10][1], offset: 0 }]]);

      const answers = new Map<number, { token: number; answer: (text: string) => void }>(); // poll -> its backup request
      const pending = new Map<number, Promise<string>>();
      const player_ = { have: NONE, haveLive: NONE, repeated: false, waiting: false, missed: false };
      // what a player asking for the number after its last one does with `out` (player.qnt, deliveryOf)
      const fetch = (out: string, restart: boolean) => {
        const newest = newestNumber(out)!;
        const first = Number(/#EXT-X-MEDIA-SEQUENCE:(\d+)/.exec(out)![1]);
        const top = contentAt(out, newest);
        if (player_.have === NONE || restart) Object.assign(player_, { have: newest, haveLive: top, waiting: false });
        else if (player_.have + 1 < first) Object.assign(player_, { have: newest, haveLive: Math.max(player_.haveLive, top), missed: true, waiting: false });
        else if (player_.have + 1 > newest) player_.waiting = player_.have > newest;
        else {
          for (let n = player_.have + 1; n <= newest; n++) {
            const live = contentAt(out, n);
            if (live !== NONE && live <= player_.haveLive) player_.repeated = true;
            player_.haveLive = Math.max(player_.haveLive, live);
          }
          Object.assign(player_, { have: newest, waiting: false });
        }
      };
      const deliver = (out: string, before: number) => {
        const restart = posted.slice(before).includes("pause");
        fetch(out, restart);
        const source = (player as any).delivered.source;
        return [newestNumber(out), source === "page" ? 0 : tokenOf(source), restart ? 1 : 0, liveNumberAt(out, newestNumber(out)!) ?? NONE, (player as any).delivered.newestLive ?? NONE];
      };

      for (const [index, state] of trace.states.entries()) {
        const [action, poll] = state;
        now = state[3];
        let delivered: State[8] | number[] = 0;
        if (action === "start") {
          asked = null;
          const before = posted.length;
          const out = player.onFetch(pageText(state), MAIN);
          await new Promise((resolve) => setTimeout(resolve, 0)); // the poll takes its turn (T-831) before it asks
          if (state[7].includes(poll)) {
            // the poll waits for the backup playlist it asked for
            expect({ index, action, askedBackup: asked != null }).toEqual({ index, action, askedBackup: true });
            answers.set(poll, { token: tokenOf(asked!.url), answer: asked!.answer });
            pending.set(poll, out);
          } else delivered = deliver(await out, before);
        } else if (action === "answer") {
          const before = posted.length;
          const { token, answer } = answers.get(poll)!;
          answer(backupText(state, tokens.get(token)!));
          answers.delete(poll);
          delivered = deliver(await pending.get(poll)!, before);
          pending.delete(poll);
        } else if (action === "token") {
          // the token request ends: GQL gives the token, usher the master with that token's variant
          const [token, lag, offset] = state[10];
          tokens.set(token, { lag, offset });
          comingToken = token;
          const inFlight = (stream as any).pendingAccess.get(StreamType.FRONTPAGE);
          gql.shift()!(JSON.stringify({ data: { streamPlaybackAccessToken: { value: `TOKEN-${token}`, signature: `SIG-${token}` } } }));
          await inFlight;
        }
        const p = player_;
        const servers = stream.getStreamByStreamType(StreamType.FRONTPAGE);
        expect({
          index,
          action,
          poll,
          delivered,
          player: [p.have, p.haveLive, +p.repeated, +p.waiting, +p.missed],
          server: servers.length ? tokenOf(servers[0].urlList[0].url) : NONE,
          servers: servers.length,
          tokenPending: +(stream as any).pendingAccess.has(StreamType.FRONTPAGE),
          tokenRequests: gql.length,
        }).toEqual({
          index,
          action,
          poll,
          delivered: state[8],
          player: state[9],
          server: state[11],
          servers: state[11] === NONE ? 0 : 1,
          tokenPending: state[12],
          // one request in flight per type (pendingAccess)
          tokenRequests: state[12],
        });
      }
    });
  }
});
