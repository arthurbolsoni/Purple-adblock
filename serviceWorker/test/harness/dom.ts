import { afterAll, beforeAll } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

export const DEFAULT_PAGE_URL = "https://www.twitch.tv/channel";

// happy-dom replaces globals (window, document, fetch, Response, URL, ...) until unregistered.
// File loading is off: a <script src> or <link> added by the code under test never reaches the network
// (a script tag fires `error`, not `load`).
export const registerDom = (url = DEFAULT_PAGE_URL) =>
  GlobalRegistrator.register({
    url,
    settings: {
      disableJavaScriptFileLoading: true,
      disableCSSFileLoading: true,
      disableIframePageLoading: true,
    },
  });

export const unregisterDom = () => GlobalRegistrator.unregister();

// Registers happy-dom for the whole file: in beforeAll, removed in afterAll.
export function useDom(url = DEFAULT_PAGE_URL) {
  beforeAll(() => registerDom(url));
  afterAll(() => unregisterDom());
}
