// T-301: XHR to edge.ads.twitch.tv answered in the page with an empty 200, without network.
import { describe, expect, test } from "bun:test";
import { installXhrHook } from "./xhr-hook";

// Like the browser's XMLHttpRequest: readyState, status and responseText are read-only getters on the prototype.
class FakeXhr extends EventTarget {
  static sent: string[] = [];
  onload: ((e: Event) => void) | null = null;
  onreadystatechange: ((e: Event) => void) | null = null;
  private url = "";
  get readyState() {
    return 0;
  }
  get status() {
    return 0;
  }
  get responseText() {
    return "network";
  }
  open(_method: string, url: string | URL) {
    this.url = String(url);
  }
  send() {
    FakeXhr.sent.push(this.url);
  }
  // the browser calls on* handler attributes when the event is dispatched
  dispatchEvent(event: Event) {
    const handler = (this as any)["on" + event.type];
    if (handler) handler.call(this, event);
    return super.dispatchEvent(event);
  }
}

const ADS = "https://edge.ads.twitch.tv/ads/format?bp=preroll&u=x";

const setup = (block: boolean) => {
  class Xhr extends FakeXhr {}
  FakeXhr.sent = [];
  const blocked: string[] = [];
  installXhrHook(Xhr as any, () => block, (url) => blocked.push(url));
  return { Xhr, blocked };
};

describe("XHR hook", () => {
  test("with blockCsai, an XHR to edge.ads.twitch.tv ends with readyState 4, status 200, an empty body and onload, without network", async () => {
    const { Xhr, blocked } = setup(true);
    const xhr: any = new Xhr();
    const events: string[] = [];
    xhr.onload = () => events.push("load");
    xhr.onreadystatechange = () => events.push(`readystatechange:${xhr.readyState}`);
    xhr.addEventListener("loadend", () => events.push("loadend"));

    xhr.open("GET", ADS);
    xhr.send();
    await Bun.sleep(5);

    expect(FakeXhr.sent).toEqual([]);
    expect([xhr.readyState, xhr.status, xhr.responseText, xhr.response]).toEqual([4, 200, "", ""]);
    expect(events).toEqual(["readystatechange:4", "load", "loadend"]);
    expect(blocked).toEqual([ADS]);
  });

  test("with blockCsai off, the XHR is sent", async () => {
    const { Xhr, blocked } = setup(false);
    const xhr: any = new Xhr();
    xhr.open("GET", ADS);
    xhr.send();
    expect(FakeXhr.sent).toEqual([ADS]);
    expect(blocked).toEqual([]);
  });

  test("other URLs are sent untouched", () => {
    const { Xhr } = setup(true);
    const xhr: any = new Xhr();
    xhr.open("GET", "https://gql.twitch.tv/gql");
    xhr.send();
    expect(FakeXhr.sent).toEqual(["https://gql.twitch.tv/gql"]);
    expect(xhr.responseText).toBe("network");
  });
});
