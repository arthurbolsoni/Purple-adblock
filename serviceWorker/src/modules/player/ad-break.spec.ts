import { describe, expect, test } from "bun:test";
import { AdBreak, AdBreakState, RECOVERING_MS, RELOAD_COOLDOWN_MS } from "./ad-break";

// TS-601: one AdBreak per player; each call to poll() is one poll of the main media playlist
const setup = (reloadAfterAd = false) => {
  const actions: string[] = [];
  let now = 1_000_000;
  const adBreak = new AdBreak({
    pauseAndPlay: () => actions.push("pauseAndPlay"),
    reload: () => actions.push("reload"),
    reloadAfterAd: () => reloadAfterAd,
    now: () => now,
  });
  const poll = (ads: boolean, after = 2000) => {
    now += after;
    return adBreak.poll(ads);
  };
  return { adBreak, actions, poll };
};

describe("AdBreak", () => {
  test("idle → ad → recovering → idle, with pause/play when the break starts and when it ends", () => {
    const { adBreak, actions, poll } = setup();
    expect(adBreak.state).toBe(AdBreakState.IDLE);

    expect(poll(false)).toBe(AdBreakState.IDLE);
    expect(actions).toEqual([]);

    expect(poll(true)).toBe(AdBreakState.AD);
    expect(actions).toEqual(["pauseAndPlay"]);
    expect(poll(true)).toBe(AdBreakState.AD);
    expect(actions).toEqual(["pauseAndPlay"]);

    expect(poll(false)).toBe(AdBreakState.RECOVERING);
    expect(actions).toEqual(["pauseAndPlay", "pauseAndPlay"]);

    // clean polls inside RECOVERING_MS keep the state, with no action
    expect(poll(false, RECOVERING_MS - 1)).toBe(AdBreakState.RECOVERING);
    expect(poll(false, 1)).toBe(AdBreakState.IDLE);
    expect(actions).toHaveLength(2);
  });

  test("ads again while recovering: back to ad with pause/play, as every change of state today (E6)", () => {
    const { actions, poll } = setup();
    poll(true);
    poll(false);
    expect(poll(true)).toBe(AdBreakState.AD);
    expect(poll(false)).toBe(AdBreakState.RECOVERING);
    expect(actions).toEqual(["pauseAndPlay", "pauseAndPlay", "pauseAndPlay", "pauseAndPlay"]);
  });

  test("without reloadAfterAd there is never a reload", () => {
    const { actions, poll } = setup(false);
    for (let i = 0; i < 5; i++) {
      poll(true);
      poll(false, RELOAD_COOLDOWN_MS);
      poll(false, RECOVERING_MS);
    }
    expect(actions).not.toContain("reload");
    expect(actions).toHaveLength(10);
  });

  test("with reloadAfterAd, the end of a break reloads instead of pause/play", () => {
    const { actions, poll } = setup(true);
    poll(true);
    poll(false);
    expect(actions).toEqual(["pauseAndPlay", "reload"]);
  });

  test("with reloadAfterAd, one reload per break: a second end inside the same break gets pause/play", () => {
    const { actions, poll } = setup(true);
    poll(true);
    poll(false);
    poll(true, RELOAD_COOLDOWN_MS);
    poll(false);
    expect(actions).toEqual(["pauseAndPlay", "reload", "pauseAndPlay", "pauseAndPlay"]);
  });

  test("with reloadAfterAd, at most one reload every RELOAD_COOLDOWN_MS", () => {
    const { actions, poll } = setup(true);
    poll(true);
    poll(false); // reload at t
    poll(false, RECOVERING_MS); // idle
    poll(true, 2000);
    poll(false, 2000); // a new break ends before t + RELOAD_COOLDOWN_MS: pause/play
    expect(actions).toEqual(["pauseAndPlay", "reload", "pauseAndPlay", "pauseAndPlay"]);

    poll(false, RECOVERING_MS); // idle
    poll(true, RELOAD_COOLDOWN_MS);
    poll(false); // past the cooldown: reload again
    expect(actions.slice(4)).toEqual(["pauseAndPlay", "reload"]);
  });

  test("the setting is read at the end of each break", () => {
    let reloadAfterAd = false;
    const actions: string[] = [];
    let now = 0;
    const adBreak = new AdBreak({
      pauseAndPlay: () => actions.push("pauseAndPlay"),
      reload: () => actions.push("reload"),
      reloadAfterAd: () => reloadAfterAd,
      now: () => now,
    });
    adBreak.poll(true);
    reloadAfterAd = true;
    now += 2000;
    adBreak.poll(false);
    expect(actions).toEqual(["pauseAndPlay", "reload"]);
  });
});
