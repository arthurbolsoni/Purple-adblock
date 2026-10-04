import { describe, expect, test } from "bun:test";
import { DEFAULT_PAGE_URL, useDom } from "./dom";
import { silenceConsole } from "./console";

useDom();
// happy-dom reports the disabled <script src> load as an error
silenceConsole(["error"]);

describe("useDom", () => {
  test("registers a document at the Twitch channel URL", () => {
    expect(location.href).toBe(DEFAULT_PAGE_URL);
    expect(window).toBe(globalThis as any);
    expect(document.body).toBeDefined();
  });

  test("a script tag never loads its file", async () => {
    const events: string[] = [];
    const script = document.createElement("script");
    script.src = "https://example.com/never-loaded.js";
    script.addEventListener("load", () => events.push("load"));
    script.addEventListener("error", () => events.push("error"));
    document.head.appendChild(script);
    await Bun.sleep(5);
    expect(events).toEqual(["error"]);
  });
});
