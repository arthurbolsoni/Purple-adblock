// popup.js runs as a classic script in the popup page; here it runs on happy-dom with the popup's markup, a
// chrome.storage mock and a chrome.tabs.query that answers with the active tab's URL (TS-603).
import { describe, expect, test } from "bun:test";
import { join } from "path";
import { silenceConsole } from "../../../../serviceWorker/test/harness/console";
import { usePageEnv } from "../../../../serviceWorker/test/harness/page-env";

const env = usePageEnv({ chrome: { whitelist: ["listed"], toggleProxy: false, proxyUrl: "" } });
silenceConsole();

const HTML = await Bun.file(join(import.meta.dir, "..", "html", "popup.html")).text();
const SOURCE = await Bun.file(join(import.meta.dir, "popup.js")).text();

// the popup opened on a tab with this URL: the text it shows
const openPopup = (url: string) => {
  document.body.innerHTML = HTML.replace(/^[\s\S]*<body>/, "").replace(/<script[\s\S]*$/, "");
  (env.chrome as any).tabs = { query: (_query: any, callback: (tabs: any[]) => void) => callback([{ url }]) };
  new Function(SOURCE)();
  return document.getElementById("watching")!.textContent;
};

describe("popup channel (T-603)", () => {
  test.each([
    ["https://www.twitch.tv/somechannel", "somechannel"],
    ["https://m.twitch.tv/somechannel", "somechannel"],
    ["https://www.twitch.tv/popout/somechannel/chat", "somechannel"],
    ["https://www.twitch.tv/popout/somechannel/chat?popout=", "somechannel"],
    ["https://www.twitch.tv/somechannel?sr=a", "somechannel"],
    ["https://www.twitch.tv/somechannel/videos", "somechannel"],
    ["https://www.twitch.tv/SomeChannel", "somechannel"],
  ])("%s → %s", (url, channel) => {
    expect(openPopup(url)).toBe("Purple on: " + channel);
  });

  test("a whitelisted channel shows as disabled, also from m.twitch.tv and the popout", () => {
    expect(openPopup("https://www.twitch.tv/listed")).toBe("Purple off: listed");
    expect(openPopup("https://m.twitch.tv/listed")).toBe("Purple off: listed");
    expect(openPopup("https://www.twitch.tv/popout/listed/chat")).toBe("Purple off: listed");
  });

  test.each(["https://www.twitch.tv/", "https://example.com/somechannel", "chrome://extensions/"])("no channel in %s", (url) => {
    expect(openPopup(url)).toBe("Open a Twitch channel");
    expect(document.getElementById("adblockbutton")!.onclick).toBeNull();
  });
});
