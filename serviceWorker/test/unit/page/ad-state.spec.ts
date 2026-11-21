// F-30 (T-605): the page is blocking an ad while any of its workers is; the listener hears each change once.
import { describe, expect, test } from "bun:test";
import { AdState } from "../../../src/page/ad-state";

describe("AdState", () => {
  test("one worker: its break starts and ends", () => {
    const heard: boolean[] = [];
    const state = new AdState<object>((blocking) => heard.push(blocking));
    const worker = {};
    state.set(worker, true);
    state.set(worker, true);
    state.set(worker, false);
    state.set(worker, false);
    expect(heard).toEqual([true, false]);
  });

  test("two workers: blocking until the last one stops, or ends", () => {
    const heard: boolean[] = [];
    const state = new AdState<object>((blocking) => heard.push(blocking));
    const [main, other] = [{}, {}];
    state.set(main, true);
    state.set(other, true);
    state.set(main, false);
    expect(heard).toEqual([true]);
    state.remove(other); // terminated in its break
    expect(heard).toEqual([true, false]);
    state.remove(main); // a worker that was not blocking changes nothing
    expect(heard).toEqual([true, false]);
  });

  test("a listener that throws does not reach the caller", () => {
    const state = new AdState<object>(() => {
      throw new Error("no window");
    });
    expect(() => state.set({}, true)).not.toThrow();
  });
});
