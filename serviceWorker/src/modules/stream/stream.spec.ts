import { afterEach, beforeEach, describe, expect, jest, spyOn, test } from "bun:test";
import { Stream } from "./stream";
import { StreamType } from "./interface/stream.enum";
import { Server } from "./interface/stream.types";
import { fixture } from "../../../test/harness/fixtures";

// Legacy variant host: the 2.6.7 regex only reads URLs starting with `https://video` (see T-104).
const MASTER = `#EXTM3U
#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="chunked",NAME="1080p60 (source)",AUTOSELECT=YES,DEFAULT=YES
#EXT-X-STREAM-INF:BANDWIDTH=6000000,RESOLUTION=1920x1080,CODECS="avc1.64002A,mp4a.40.2",VIDEO="chunked",FRAME-RATE=60.000
https://video-weaver.example.hls.ttvnw.net/v1/playlist/chunked.m3u8
#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="720p60",NAME="720p60",AUTOSELECT=YES,DEFAULT=YES
#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720,CODECS="avc1.4D401F,mp4a.40.2",VIDEO="720p60",FRAME-RATE=60.000
https://video-weaver.example.hls.ttvnw.net/v1/playlist/720p60.m3u8
#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="160p30",NAME="160p",AUTOSELECT=YES,DEFAULT=YES
#EXT-X-STREAM-INF:BANDWIDTH=230000,RESOLUTION=284x160,CODECS="avc1.4D400C,mp4a.40.2",VIDEO="160p30",FRAME-RATE=30.000
https://video-weaver.example.hls.ttvnw.net/v1/playlist/160p30.m3u8
`;

const makeContext = (handler: (url: string, init?: any) => Response | Promise<Response>) => {
  const requests: { url: string; init?: any }[] = [];
  const logs: any[] = [];
  return {
    requests,
    logs,
    logger: (...args: any[]) => logs.push(args),
    postMessage: () => {},
    request: async (url: any, init?: any) => {
      requests.push({ url, init });
      return handler(url, init);
    },
  };
};

beforeEach(() => {
  spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

const noNetwork = () => makeContext(() => new Response("", { status: 500 }));

describe("Stream server list", () => {
  test("setStreamAccess reads the variants of a master playlist", () => {
    const stream = new Stream("channel", noNetwork());
    stream.setStreamAccess(MASTER, StreamType.FRONTPAGE);

    expect(stream.serverList).toHaveLength(1);
    const server = stream.serverList[0];
    expect(server.type).toBe(StreamType.FRONTPAGE);
    expect(server.sig).toBe(true);
    expect(server.urlList.map((v) => ({ ...v }))).toEqual([
      { quality: "1080p60 (source)", resolution: "1920x1080", codecs: "avc1.64002A,mp4a.40.2", bandwidth: 6000000, url: "https://video-weaver.example.hls.ttvnw.net/v1/playlist/chunked.m3u8" },
      { quality: "720p60", resolution: "1280x720", codecs: "avc1.4D401F,mp4a.40.2", bandwidth: 3000000, url: "https://video-weaver.example.hls.ttvnw.net/v1/playlist/720p60.m3u8" },
      { quality: "160p", resolution: "284x160", codecs: "avc1.4D400C,mp4a.40.2", bandwidth: 230000, url: "https://video-weaver.example.hls.ttvnw.net/v1/playlist/160p30.m3u8" },
    ]);
    expect(server.bestQuality()?.quality).toBe("1080p60 (source)");
    expect(server.findByQuality("720p60")?.url).toContain("720p60.m3u8");
    expect(server.findByQuality("480p30")).toBeUndefined();
  });

  // T-104
  test("setStreamAccess reads variants on *.playlist.ttvnw.net, and bestQuality is the highest bandwidth, not the first line", () => {
    const stream = new Stream("channel", noNetwork());
    stream.setStreamAccess(fixture("m3u8/master-frontpage-v1.m3u8"), StreamType.FRONTPAGE);

    const [server] = stream.serverList;
    expect(server.urlList).toHaveLength(5);
    expect(server.urlList[0].quality).toBe("360p30");
    expect(server.bestQuality()?.quality).toBe("1080p60");
    expect(server.findByQuality("720p60")?.url).toStartWith("https://sae12.playlist.ttvnw.net/v1/playlist/");
  });

  test("a master without variants creates no server", () => {
    const stream = new Stream("channel", noNetwork());
    stream.setStreamAccess(fixture("m3u8/master-empty.m3u8"), StreamType.FRONTPAGE);
    stream.setStreamAccess("", StreamType.PICTURE);
    expect(stream.serverList).toEqual([]);
  });

  test("setStreamAccess defaults to type local", () => {
    const stream = new Stream("channel", noNetwork());
    stream.setStreamAccess(MASTER);
    expect(stream.serverList[0].type).toBe("local");
  });

  test("getStreamByStreamType filters by type", () => {
    const stream = new Stream("channel", noNetwork());
    stream.setStreamAccess(MASTER, StreamType.FRONTPAGE);
    stream.setStreamAccess(MASTER, StreamType.PICTURE);
    stream.setStreamAccess(MASTER, StreamType.FRONTPAGE);

    expect(stream.getStreamByStreamType(StreamType.FRONTPAGE)).toHaveLength(2);
    expect(stream.getStreamByStreamType(StreamType.PICTURE)).toEqual([stream.serverList[1]]);
    expect(stream.getStreamByStreamType(StreamType.EMBED)).toEqual([]);
  });

  test("removeServer removes only the given server", () => {
    const stream = new Stream("channel", noNetwork());
    stream.setStreamAccess(MASTER, StreamType.FRONTPAGE);
    stream.setStreamAccess(MASTER, StreamType.PICTURE);
    const [frontpage, picture] = stream.serverList;

    stream.removeServer(new Server({ type: StreamType.FRONTPAGE, urlList: [], sig: true }));
    expect(stream.serverList).toEqual([frontpage, picture]);

    stream.removeServer(frontpage);
    expect(stream.serverList).toEqual([picture]);
  });
});

describe("Stream.createStreamAccess", () => {
  test("requests a token for the playerType, then the usher master, and stores the server", async () => {
    const context = makeContext((url) => {
      if (url.startsWith("https://gql.twitch.tv/gql")) {
        return Response.json({ data: { streamPlaybackAccessToken: { value: '{"hide_ads":false}', signature: "SIG" } } });
      }
      return new Response(MASTER);
    });
    const stream = new Stream("channel", context);

    await stream.createStreamAccess(StreamType.FRONTPAGE, "INTEGRITY");

    expect(context.requests).toHaveLength(2);
    const [gql, usher] = context.requests;
    expect(gql.url).toBe("https://gql.twitch.tv/gql#origin=twilight");
    expect(gql.init.method).toBe("POST");
    expect(gql.init.headers["Client-ID"]).toBe("kimne78kx3ncx6brgo4mv6wki5h1ko");
    expect(gql.init.headers["Client-Integrity"]).toBe("INTEGRITY");
    const body = JSON.parse(gql.init.body);
    expect(body.operationName).toBe("PlaybackAccessToken");
    expect(body.variables).toMatchObject({ login: "channel", playerType: "frontpage", isLive: true, isVod: false });

    expect(usher.url).toStartWith("https://usher.ttvnw.net/api/channel/hls/channel.m3u8?");
    const query = new URL(usher.url).searchParams;
    expect(query.get("sig")).toBe("SIG");
    expect(query.get("token")).toBe('{"hide_ads":false}');
    expect(query.get("supported_codecs")).toBe("avc1");

    expect(stream.getStreamByStreamType(StreamType.FRONTPAGE)).toHaveLength(1);
    expect(stream.serverList[0].urlList).toHaveLength(3);
  });

  // T-105
  test("two concurrent calls for one playerType make one token and one usher request, and store one server", async () => {
    const context = makeContext((url) =>
      url.startsWith("https://gql.twitch.tv/gql") ? Response.json({ data: { streamPlaybackAccessToken: { value: "{}", signature: "SIG" } } }) : new Response(MASTER),
    );
    const stream = new Stream("channel", context);

    await Promise.all([stream.createStreamAccess(StreamType.FRONTPAGE, ""), stream.createStreamAccess(StreamType.FRONTPAGE, "")]);

    expect(context.requests).toHaveLength(2);
    expect(stream.getStreamByStreamType(StreamType.FRONTPAGE)).toHaveLength(1);
  });

  test("a new token for a playerType replaces its server instead of adding one", async () => {
    const context = makeContext((url) =>
      url.startsWith("https://gql.twitch.tv/gql") ? Response.json({ data: { streamPlaybackAccessToken: { value: "{}", signature: "SIG" } } }) : new Response(MASTER),
    );
    const stream = new Stream("channel", context);
    stream.setStreamAccess(MASTER, StreamType.PICTURE);

    await stream.createStreamAccess(StreamType.FRONTPAGE, "");
    const [first] = stream.getStreamByStreamType(StreamType.FRONTPAGE);
    await stream.createStreamAccess(StreamType.FRONTPAGE, "");

    expect(stream.getStreamByStreamType(StreamType.FRONTPAGE)).toHaveLength(1);
    expect(stream.getStreamByStreamType(StreamType.FRONTPAGE)[0]).not.toBe(first);
    expect(stream.getStreamByStreamType(StreamType.PICTURE)).toHaveLength(1);
    expect(context.requests).toHaveLength(4);
  });

  test("a rejected token request does not throw and reaches the logger", async () => {
    const context = makeContext(() => {
      throw new TypeError("Failed to fetch");
    });
    const stream = new Stream("channel", context);

    await stream.createStreamAccess(StreamType.FRONTPAGE, "");

    expect(stream.serverList).toEqual([]);
    expect(context.logs).toHaveLength(1);
    expect(String(context.logs[0][0])).toContain("Failed to fetch");
  });

  test("a failed token request is logged and does not throw", async () => {
    const context = makeContext(() => Response.json({ errors: [{ message: "PersistedQueryNotFound" }] }));
    const stream = new Stream("channel", context);

    await stream.createStreamAccess(StreamType.PICTURE, "");

    expect(stream.serverList).toEqual([]);
    expect(context.logs).toHaveLength(1);
  });
});
