// A page for page/diagnostics.ts (F-31): <video> elements, a document that finds them and Twitch's overlays, a Media
// Source with SourceBuffers whose buffered ranges a test sets, and URL.createObjectURL. Media events are fired by the
// test (`page.fire`), the way the browser dispatches them to the document's capturing listeners.
import { Diagnostics, type DiagEntry } from "../../src/page/diagnostics";
import { FakeClock } from "./clock";

export class FakeVideo {
  tagName = "VIDEO";
  currentTime = 0;
  paused = false;
  seeking = false;
  ended = false;
  readyState = 4;
  videoWidth = 1280;
  videoHeight = 720;
  src = "";
  currentSrc = "";
  srcObject: any = null;
  error: any = null;
  rect = { width: 1280, height: 720 };
  quality = { totalVideoFrames: 0, droppedVideoFrames: 0, corruptedVideoFrames: 0 };
  getBoundingClientRect() {
    return this.rect;
  }
  getVideoPlaybackQuality() {
    return { ...this.quality };
  }
}

// buffered ranges, as TimeRanges
export const ranges = (...pairs: [number, number][]) => ({ length: pairs.length, start: (i: number) => pairs[i][0], end: (i: number) => pairs[i][1] });

export class FakeSourceBuffer {
  buffered = ranges();
  changeType(_type: string) {}
}

export class FakeMediaSource {
  readyState = "open";
  addSourceBuffer(_type: string): any {
    return new FakeSourceBuffer();
  }
}

export class FakeMediaDocument {
  videos: FakeVideo[] = [];
  elements = new Map<string, any>();
  visibilityState = "visible";
  private listeners = new Map<string, ((event: any) => void)[]>();

  querySelectorAll(selector: string) {
    return selector === "video" ? this.videos : [];
  }
  querySelector(selector: string) {
    return this.elements.get(selector) ?? null;
  }
  addEventListener(type: string, listener: (event: any) => void, _capture?: boolean) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }
  fire(type: string, target: any) {
    for (const listener of this.listeners.get(type) ?? []) listener({ type, target });
  }
}

export function createMediaPage({ path = "/channel_a", settings = { whitelist: [] } as any } = {}) {
  const clock = new FakeClock();
  const document = new FakeMediaDocument();
  // a fresh class per page: install() wraps its prototype
  class MediaSource extends FakeMediaSource {}
  class SourceBuffer extends FakeSourceBuffer {}
  MediaSource.prototype.addSourceBuffer = function () {
    return new SourceBuffer();
  };
  let urls = 0;
  const window = {
    location: { pathname: path },
    MediaSource,
    SourceBuffer,
    URL: { createObjectURL: (_object: any) => `blob:https://www.twitch.tv/media-${++urls}` },
  };
  const posts: DiagEntry[][] = [];
  const diagnostics = new Diagnostics({ window, document, post: (entries) => posts.push(entries), timers: clock });
  diagnostics.install();
  if (settings) diagnostics.setSettings(settings);

  const page = {
    clock,
    document,
    window,
    diagnostics,
    posts,
    // every entry posted so far, with the ones waiting for their batch
    entries: (type?: string) => {
      diagnostics.flushNow();
      return posts.flat().filter((entry) => !type || entry.type === type);
    },
    fire: (type: string, target: any) => document.fire(type, target),
    // a <video> playing a Media Source with SourceBuffers of these types
    video: (...types: string[]) => {
      const video = new FakeVideo();
      const source = new window.MediaSource();
      const buffers = types.map((type) => source.addSourceBuffer(type));
      video.src = video.currentSrc = window.URL.createObjectURL(source);
      document.videos.push(video);
      return { video, source, buffers };
    },
    // `ms` of playback, a tick at a time: the time moves and 30 frames are decoded each second
    play: (video: FakeVideo, ms: number, { frames = 30 } = {}) => {
      for (let left = ms; left > 0; left -= 1000) {
        const step = Math.min(1000, left);
        video.currentTime += step / 1000;
        video.quality.totalVideoFrames += Math.round((frames * step) / 1000);
        clock.advance(step);
      }
    },
  };
  return page;
}

export type MediaPage = ReturnType<typeof createMediaPage>;
