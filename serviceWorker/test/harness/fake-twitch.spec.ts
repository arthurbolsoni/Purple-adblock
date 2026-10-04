import { describe, expect, test } from "bun:test";
import { FakeTwitch, sigFor, tokenFor } from "./fake-twitch";
import { fixture, fixtureJson } from "./fixtures";

const tokenBody = (playerType: string) =>
  JSON.stringify({ operationName: "PlaybackAccessToken", variables: { login: "channel", playerType }, extensions: {} });

describe("FakeTwitch", () => {
  test("usher v1 and v2 serve the master of the channel", async () => {
    const master = fixture("m3u8/master-avc.m3u8");
    const twitch = new FakeTwitch().master("channel", master);

    const v1 = await twitch.fetch("https://usher.ttvnw.net/api/channel/hls/channel.m3u8?token=real&sig=real");
    const v2 = await twitch.fetch("https://usher.ttvnw.net/api/v2/channel/hls/channel.m3u8");
    const other = await twitch.fetch("https://usher.ttvnw.net/api/channel/hls/other.m3u8");

    expect(await v1.text()).toBe(master);
    expect(await v2.text()).toBe(master);
    expect(other.status).toBe(404);
    expect(twitch.callsOf("usher").map((c) => [c.channel, c.playerType])).toEqual([
      ["channel", "site"],
      ["channel", "site"],
      ["other", "site"],
    ]);
  });

  test("usher picks the master by the playerType of the issued token", async () => {
    const twitch = new FakeTwitch().master("channel", "#EXTM3U\n#main\n").master("channel", "#EXTM3U\n#frontpage\n", "frontpage");

    const url = `https://usher.ttvnw.net/api/channel/hls/channel.m3u8?sig=${sigFor("frontpage")}&token=${encodeURIComponent(tokenFor("frontpage"))}`;
    expect(await (await twitch.fetch(url)).text()).toBe("#EXTM3U\n#frontpage\n");
    expect(twitch.calls[0].playerType).toBe("frontpage");
  });

  test("media playlists answer one response per poll and repeat the last one", async () => {
    const url = "https://edge.playlist.ttvnw.net/v1/playlist/chunked.m3u8";
    const twitch = new FakeTwitch().mediaPlaylist(url, "first", "second");

    const polls = [];
    for (let i = 0; i < 3; i++) polls.push(await (await twitch.fetch(url + "?n=" + i)).text());

    expect(polls).toEqual(["first", "second", "second"]);
    expect(twitch.callsOf("media")).toHaveLength(3);
  });

  test("gql answers PlaybackAccessToken per playerType", async () => {
    const twitch = new FakeTwitch();
    const response = await twitch.fetch("https://gql.twitch.tv/gql#origin=twilight", {
      method: "POST",
      headers: { "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko", "Client-Integrity": "INTEGRITY" },
      body: tokenBody("frontpage"),
    });

    expect(await response.json()).toMatchObject({ data: { streamPlaybackAccessToken: { value: "TOKEN-frontpage", signature: "SIG-frontpage" } } });
    const [call] = twitch.callsOf("gql");
    expect(call.playerType).toBe("frontpage");
    expect(call.method).toBe("POST");
    expect(call.headers["client-integrity"]).toBe("INTEGRITY");
    expect(JSON.parse(call.body!).variables.playerType).toBe("frontpage");
  });

  test("gql replies can be configured per playerType, with a status", async () => {
    const twitch = new FakeTwitch().token("embed", fixtureJson("gql/persisted-not-found.json")).token("popout", { errors: [] }, 500);

    const embed = await twitch.fetch("https://gql.twitch.tv/gql", { method: "POST", body: tokenBody("embed") });
    const popout = await twitch.fetch("https://gql.twitch.tv/gql", { method: "POST", body: tokenBody("popout") });

    expect((await embed.json()).errors[0].message).toBe("PersistedQueryNotFound");
    expect(popout.status).toBe(500);
  });

  test("a batched gql body gets a batched reply", async () => {
    const twitch = new FakeTwitch();
    const batch = fixtureJson("gql/page-token-batch.json");

    const reply = await (await twitch.fetch("https://gql.twitch.tv/gql", { method: "POST", body: JSON.stringify(batch) })).json();

    expect(reply).toHaveLength(3);
    expect(reply[1].data.streamPlaybackAccessToken.value).toBe("TOKEN-site");
    expect(twitch.calls[0].playerType).toBe("site");
  });

  test("integrity, ads and unknown URLs", async () => {
    const twitch = new FakeTwitch();

    expect((await (await twitch.fetch("https://gql.twitch.tv/integrity", { method: "POST" })).json()).token).toBe("INTEGRITY");
    expect((await twitch.fetch("https://edge.ads.twitch.tv/ads?bp=preroll")).status).toBe(200);
    expect((await twitch.fetch("https://example.com/")).status).toBe(404);

    expect(twitch.calls.map((c) => c.kind)).toEqual(["integrity", "ads", "unknown"]);
  });

  test("accepts Request and URL inputs", async () => {
    const twitch = new FakeTwitch().master("channel", "#EXTM3U\n");

    await twitch.fetch(new URL("https://usher.ttvnw.net/api/channel/hls/channel.m3u8"));
    await twitch.fetch(new Request("https://gql.twitch.tv/gql", { method: "POST", body: tokenBody("site"), headers: { "X-Device-Id": "DEVICE_ID" } }));

    expect(twitch.calls.map((c) => c.kind)).toEqual(["usher", "gql"]);
    expect(twitch.calls[1].headers["x-device-id"]).toBe("DEVICE_ID");
  });
});
