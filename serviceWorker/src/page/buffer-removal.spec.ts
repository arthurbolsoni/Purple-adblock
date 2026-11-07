// F-29 (T-829): a removal from a SourceBuffer that holds both tracks leaves nothing outside the buffered range.
// Firefox 157 on an fMP4 channel (2026-11-07): the player frees the buffer behind the playhead with remove(2, 2.518);
// the video goes up to its next key frame, the audio only to 2.518, and the audio left there played again after the
// player started its timeline over at 0 (a pause and play). The fake SourceBuffer records the ranges it is asked for.
import { describe, expect, test } from "bun:test";
import { installBufferRemovalWidening, widenRemoval } from "./buffer-removal";

const ranges = (...list: [number, number][]) => ({
  length: list.length,
  start: (i: number) => list[i][0],
  end: (i: number) => list[i][1],
});

const setup = (enabled = true) => {
  class FakeSourceBuffer {
    removed: [number, number][] = [];
    buffered = ranges([2, 34.533]);
    remove(start: number, end: number) {
      this.removed.push([start, end]);
    }
  }
  class FakeMediaSource {
    addSourceBuffer(_type: string) {
      return new FakeSourceBuffer();
    }
  }
  const scope = { MediaSource: FakeMediaSource, SourceBuffer: FakeSourceBuffer };
  const installed = installBufferRemovalWidening(scope, () => enabled);
  return { installed, source: new FakeMediaSource() };
};

const MUXED = 'video/mp4;codecs="avc1.4D401F,mp4a.40.2"';

describe("F-29: removals from a SourceBuffer with audio and video", () => {
  test("a removal from the buffered start starts at 0 (the audio left behind earlier goes too)", () => {
    const { installed, source } = setup();
    expect(installed).toBe(true);
    const buffer: any = source.addSourceBuffer(MUXED);
    buffer.remove(2, 2.518);
    expect(buffer.removed).toEqual([[0, 2.518]]);
  });

  test("a removal to the buffered end goes to the end (the player's restart: remove(18, 49.616))", () => {
    const { source } = setup();
    const buffer: any = source.addSourceBuffer(MUXED);
    buffer.buffered = ranges([18, 49.616]);
    buffer.remove(18, 49.616);
    expect(buffer.removed).toEqual([[0, Infinity]]);
  });

  test("a removal inside the buffered range is left as asked", () => {
    const { source } = setup();
    const buffer: any = source.addSourceBuffer(MUXED);
    buffer.remove(10, 20);
    expect(buffer.removed).toEqual([[10, 20]]);
  });

  test("a SourceBuffer with one track (a TS channel's) is left alone", () => {
    const { source } = setup();
    const audio: any = source.addSourceBuffer('video/mp4;codecs="mp4a.40.2"');
    const video: any = source.addSourceBuffer('video/mp4;codecs="avc1.4D401F"');
    audio.remove(2, 2.518);
    video.remove(2, 2.518);
    expect(audio.removed).toEqual([[2, 2.518]]);
    expect(video.removed).toEqual([[2, 2.518]]);
  });

  test("with the setting off, the removal is left as asked", () => {
    const { source } = setup(false);
    const buffer: any = source.addSourceBuffer(MUXED);
    buffer.remove(2, 2.518);
    expect(buffer.removed).toEqual([[2, 2.518]]);
  });

  test("a failure reading the buffered ranges leaves the removal as asked (rule 5)", () => {
    const { source } = setup();
    const buffer: any = source.addSourceBuffer(MUXED);
    Object.defineProperty(buffer, "buffered", {
      get() {
        throw new Error("InvalidStateError");
      },
    });
    buffer.remove(2, 2.518);
    expect(buffer.removed).toEqual([[2, 2.518]]);
  });

  test("no MediaSource in the scope: nothing installed", () => {
    expect(installBufferRemovalWidening({}, () => true)).toBe(false);
  });
});

describe("widenRemoval", () => {
  test("nothing buffered: left as asked", () => {
    expect(widenRemoval(ranges(), 2, 4)).toBeNull();
  });

  test("within 0.1 s of the buffered start and end", () => {
    expect(widenRemoval(ranges([2, 30], [40, 50]), 2.05, 49.95)).toEqual([0, Infinity]);
    expect(widenRemoval(ranges([2, 30], [40, 50]), 2.2, 49.8)).toBeNull();
  });
});
