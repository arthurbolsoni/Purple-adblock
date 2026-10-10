// T-403: current persisted query hash with `platform`, flat response shape, full-query fallback.
import { describe, expect, test } from "bun:test";
import { fixtureJson } from "../../../test/harness/fixtures";
import { TwitchService, usherUrl } from "./twitch.service";

const HASH = "ed230aa1e33e07eebb8928504583da78a5173989fadfb1ac94be06a04f3cdbe9";

const service = (...answers: any[]) => {
  const requests: { url: string; init: any }[] = [];
  const context = {
    postMessage: () => {},
    logger: () => {},
    request: async (url: any, init?: any) => {
      requests.push({ url, init });
      const answer = answers[Math.min(requests.length - 1, answers.length - 1)];
      return Response.json(answer);
    },
  };
  return { requests, twitch: new TwitchService(context), body: (i: number) => JSON.parse(requests[i].init.body) };
};

describe("TwitchService.playbackAccessToken", () => {
  test("the persisted query carries the current hash and platform web", async () => {
    const { twitch, requests, body } = service(fixtureJson("gql/token-ok.json"));

    expect(await twitch.playbackAccessToken("channel", "frontpage", "INTEGRITY")).toEqual({ token: "TOKEN", signature: "SIG" });

    expect(requests).toHaveLength(1);
    expect(body(0)).toEqual({
      operationName: "PlaybackAccessToken",
      variables: { isLive: true, login: "channel", isVod: false, vodID: "", playerType: "frontpage", platform: "web" },
      extensions: { persistedQuery: { version: 1, sha256Hash: HASH } },
    });
    expect(requests[0].init.headers["Client-Integrity"]).toBe("INTEGRITY");
  });

  test("autoplay is requested with platform android", async () => {
    const { twitch, body } = service(fixtureJson("gql/token-ok.json"));
    await twitch.playbackAccessToken("channel", "autoplay", "", "android");
    expect(body(0).variables).toMatchObject({ playerType: "autoplay", platform: "android" });
  });

  test("the flat shape (seen for embed) is accepted", async () => {
    const { twitch, requests } = service(fixtureJson("gql/token-flat.json"));
    expect(await twitch.playbackAccessToken("channel", "embed", "")).toEqual({ token: "TOKEN", signature: "SIG" });
    expect(requests).toHaveLength(1);
  });

  test.each([
    ["PersistedQueryNotFound", "gql/persisted-not-found.json"],
    ["a missing streamPlaybackAccessToken", "gql/token-integrity-error.json"],
  ])("%s retries once with the full query, keeping playerType and platform", async (_, first) => {
    const { twitch, requests, body } = service(fixtureJson(first), fixtureJson("gql/token-ok.json"));

    expect(await twitch.playbackAccessToken("channel", "autoplay", "INTEGRITY", "android")).toEqual({ token: "TOKEN", signature: "SIG" });

    expect(requests).toHaveLength(2);
    expect(body(1).operationName).toBe("PlaybackAccessToken_Template");
    expect(body(1).query).toContain("streamPlaybackAccessToken(channelName: $login");
    expect(body(1).query).toContain("platform: $platform");
    expect(body(1).variables).toMatchObject({ login: "channel", playerType: "autoplay", platform: "android", isLive: true });
  });

  test("when the full query fails too, it throws (the caller logs it)", async () => {
    const { twitch, requests } = service(fixtureJson("gql/persisted-not-found.json"), fixtureJson("gql/token-integrity-error.json"));
    await expect(twitch.playbackAccessToken("channel", "site", "")).rejects.toThrow();
    expect(requests).toHaveLength(2);
  });
});

// T-404 (F-08): a backup usher URL is the page's own request with only token, sig and p replaced
describe("usherUrl", () => {
  const ACCESS = { token: '{"channel":"somechannel","x":"a&b#c+d"}', signature: "s+i/g=" };
  const PAGE =
    "https://usher.ttvnw.net/api/v2/channel/hls/somechannel.m3u8?acmb=e30%3D&allow_source=true&p=1234567&play_session_id=PLAY_SESSION_ID" +
    "&player_backend=mediaplayer&sig=PAGE_SIG&supported_codecs=av1,h265,h264&token=PAGE_TOKEN&transcode_mode=cbr_v1";

  test("the page's parameters stay, in their order; token, sig and p change; the v2 path stays", () => {
    const url = new URL(usherUrl("somechannel", ACCESS, PAGE));
    expect(url.origin + url.pathname).toBe("https://usher.ttvnw.net/api/v2/channel/hls/somechannel.m3u8");
    expect([...url.searchParams.keys()]).toEqual(["acmb", "allow_source", "p", "play_session_id", "player_backend", "sig", "supported_codecs", "token", "transcode_mode"]);
    expect(url.searchParams.get("supported_codecs")).toBe("av1,h265,h264");
    expect(url.searchParams.get("play_session_id")).toBe("PLAY_SESSION_ID");
    expect(url.searchParams.get("token")).toBe(ACCESS.token);
    expect(url.searchParams.get("sig")).toBe(ACCESS.signature);
    expect(url.searchParams.get("p")).toMatch(/^\d+$/);
    expect(url.searchParams.get("p")).not.toBe("1234567");
  });

  test("token and sig go through encodeURIComponent; the page's other values stay as written", () => {
    const raw = usherUrl("somechannel", ACCESS, PAGE);
    expect(raw).toContain(`&token=${encodeURIComponent(ACCESS.token)}&`);
    expect(raw).toContain(`&sig=${encodeURIComponent(ACCESS.signature)}&`);
    expect(raw).toContain("?acmb=e30%3D&");
    expect(raw).toContain("&supported_codecs=av1,h265,h264&");
  });

  test("a v1 request keeps the v1 path; a request without p gets one", () => {
    const url = new URL(usherUrl("somechannel", ACCESS, "https://usher.ttvnw.net/api/channel/hls/somechannel.m3u8?token=T&sig=S&allow_source=true"));
    expect(url.pathname).toBe("/api/channel/hls/somechannel.m3u8");
    expect([...url.searchParams.keys()]).toEqual(["token", "sig", "allow_source", "p"]);
  });

  test("without the page's request: Purple's parameters on the v1 path, token and sig encoded", () => {
    const raw = usherUrl("somechannel", ACCESS);
    const url = new URL(raw);
    expect(url.pathname).toBe("/api/channel/hls/somechannel.m3u8");
    expect(url.searchParams.get("supported_codecs")).toBe("avc1");
    expect(url.searchParams.get("token")).toBe(ACCESS.token);
    expect(raw).toContain(`token=${encodeURIComponent(ACCESS.token)}`);
    expect(raw).toContain(`sig=${encodeURIComponent(ACCESS.signature)}`);
  });
});
