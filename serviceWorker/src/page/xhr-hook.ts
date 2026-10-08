// T-301 (F-04): an XHR to edge.ads.twitch.tv is answered in the page with an empty 200, without network. Every other
// XHR is untouched (CLAUDE.md rule 4).

export const isEdgeAds = (url: string) => {
  try {
    return new URL(url, "https://www.twitch.tv/").host === "edge.ads.twitch.tv";
  } catch {
    return false;
  }
};

// readyState, status and the body are read-only getters on the prototype; own properties on the instance shadow them
function answerEmpty(xhr: XMLHttpRequest, url: string) {
  const values: Record<string, unknown> = { readyState: 4, status: 200, statusText: "OK", responseText: "", response: "", responseURL: url };
  for (const [name, value] of Object.entries(values)) Object.defineProperty(xhr, name, { configurable: true, value });
  setTimeout(() => {
    for (const type of ["readystatechange", "load", "loadend"]) xhr.dispatchEvent(new Event(type));
  }, 0);
}

export function installXhrHook(XHR: typeof XMLHttpRequest, blockCsai: () => boolean, onBlocked: (url: string) => void) {
  const urls = new WeakMap<XMLHttpRequest, string>();
  const open = XHR.prototype.open;
  const send = XHR.prototype.send;

  XHR.prototype.open = function (this: XMLHttpRequest, method: string, url: string | URL, ...rest: any[]) {
    urls.set(this, String(url));
    return (open as any).call(this, method, url, ...rest);
  } as any;

  XHR.prototype.send = function (this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null) {
    const url = urls.get(this);
    try {
      if (url && isEdgeAds(url) && blockCsai()) {
        answerEmpty(this, url);
        onBlocked(url);
        return;
      }
    } catch {
      // a failure here must not stop the page's request
    }
    return send.call(this, body);
  };
}
