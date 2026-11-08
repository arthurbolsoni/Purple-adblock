// T-010: the real AdBreak against the Quint model (test/model/ad-break.qnt). Each trace in test/model/traces/ad-break.json
// (`bun run model:traces ad-break`) is replayed step by step: polls with or without ads at the model's times, and the
// reloadAfterAd setting turned on and off; after each step AdBreak's state and the action it called (pause and play,
// a reload, or none) must be what the model says.
import { describe, expect, test } from "bun:test";
import { AdBreak } from "../../src/modules/player/ad-break";
import traces from "../model/traces/ad-break.json";

// one state of a trace, as quint.ts writes it
type State = [action: string, ads: number, gap: number, setting: number, state: string, called: string];

describe("AdBreak against the Quint model (T-010)", () => {
  for (const trace of traces as { name: string; states: State[] }[]) {
    test(trace.name, () => {
      let now = 1000000; // ad-break.qnt, init
      let reloadAfterAd = false;
      let called = "";
      const adBreak = new AdBreak({
        pauseAndPlay: () => (called = "pauseAndPlay"),
        reload: () => (called = "reload"),
        reloadAfterAd: () => reloadAfterAd,
        now: () => now,
      });
      for (const [index, [action, ads, gap, setting, state, expected]] of trace.states.entries()) {
        called = "";
        if (action === "poll") {
          now += gap;
          adBreak.poll(ads === 1);
        } else if (action === "setting") reloadAfterAd = setting === 1;
        expect({ index, action, state: adBreak.state, called }).toEqual({ index, action, state, called: expected });
      }
    });
  }
});
