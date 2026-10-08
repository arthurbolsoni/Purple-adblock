// T-403: current persisted query hash with `platform`, flat response shape, full-query fallback.
import { describe, expect, test } from "bun:test";
import { fixtureJson } from "../../../test/harness/fixtures";
import { TwitchService } from "./twitch.service";

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
