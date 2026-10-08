import { describe, expect, test } from "bun:test";
import { reloadTwitchPlayer } from "./player-reload";

// A React fiber tree as Twitch's page has it: the player component (setPlayerActive, props.mediaPlayerInstance) and
// the player state component (setSrc, setInitialPlaybackSettings) somewhere under #root.
const fiber = (stateNode: any, child?: any, sibling?: any) => ({ stateNode, child, sibling });

const twitchPage = (rootKey: "fiber" | "legacy" = "fiber") => {
  const setSrc: any[] = [];
  let played = 0;
  const player = { play: () => (played++, Promise.resolve()), core: { state: { quality: { group: "720p60" } } } };
  const playerState = { setSrc: (options: any) => setSrc.push(options), setInitialPlaybackSettings() {} };
  const holder = { setPlayerActive() {}, props: { mediaPlayerInstance: { playerInstance: player } } };
  const tree = fiber(null, fiber({}, fiber(holder, undefined, fiber({ other: true }, undefined, fiber(playerState)))));
  const root: any = rootKey === "fiber" ? { "__reactContainer$x1y2": tree } : { _reactRootContainer: { _internalRoot: { current: tree } } };
  const storage = new Map<string, string>();
  return {
    doc: { querySelector: (selector: string) => (selector === "#root" ? root : null) },
    storage: { setItem: (key: string, value: string) => storage.set(key, value) },
    setSrc,
    played: () => played,
    stored: storage,
    playerState,
  };
};

describe("reloadTwitchPlayer (T-601)", () => {
  test("finds the player state under #root and reloads with a soft setSrc, keeping the quality", () => {
    const page = twitchPage();
    expect(reloadTwitchPlayer(page.doc, page.storage)).toBe(true);
    expect(page.setSrc).toEqual([{ isNewMediaPlayerInstance: false, refreshAccessToken: false }]);
    expect(page.stored.get("video-quality")).toBe(JSON.stringify({ default: "720p60" }));
    expect(page.played()).toBe(1);
  });

  test("works with the legacy React root container", () => {
    const page = twitchPage("legacy");
    expect(reloadTwitchPlayer(page.doc, page.storage)).toBe(true);
    expect(page.setSrc).toHaveLength(1);
  });

  test("without #root or without a player state, nothing happens and it returns false", () => {
    expect(reloadTwitchPlayer({ querySelector: () => null })).toBe(false);
    const empty = { querySelector: () => ({ "__reactContainer$x": fiber({}, fiber({})) }) };
    expect(reloadTwitchPlayer(empty)).toBe(false);
  });

  test("a setSrc that throws returns false instead of breaking the page", () => {
    const page = twitchPage();
    page.playerState.setSrc = () => {
      throw new Error("renamed");
    };
    expect(reloadTwitchPlayer(page.doc, page.storage)).toBe(false);
  });
});
