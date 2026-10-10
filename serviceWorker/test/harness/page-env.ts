// Page-side fakes for index.ts and the platform scripts: Worker, synchronous XHR, page fetch, blob URLs and
// chrome.storage. `usePageEnv()` installs them on top of happy-dom for one test file and restores everything after.
import { afterAll, beforeAll } from "bun:test";
import { DEFAULT_PAGE_URL, registerDom, unregisterDom } from "./dom";

type Listener = (event: any) => void;

// Worker stand-in. index.ts extends the global `Worker`, so this must be installed before index.ts is imported.
export class FakeWorker {
  static instances: FakeWorker[] = [];
  url: string;
  options: any;
  posted: any[] = [];
  terminated = 0;
  private listeners = new Map<string, Listener[]>();

  constructor(url: string | URL, options?: any) {
    this.url = String(url);
    this.options = options;
    FakeWorker.instances.push(this);
  }

  addEventListener(type: string, listener: Listener) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  removeEventListener(type: string, listener: Listener) {
    this.listeners.set(type, (this.listeners.get(type) ?? []).filter((l) => l !== listener));
  }

  // page -> worker
  postMessage(message: any) {
    this.posted.push(message);
  }

  // worker -> page
  emit(data: any) {
    for (const listener of this.listeners.get("message") ?? []) listener({ data, target: this });
  }

  terminate() {
    this.terminated++;
  }
}

// Synchronous XHR used by index.ts to download the original worker script. URLs in `throwing` make send() throw,
// like a blocked or cross-origin request.
export class FakeXMLHttpRequest {
  static scripts = new Map<string, string>();
  static throwing = new Set<string>();
  static requests: { method: string; url: string; async: boolean }[] = [];
  method = "";
  url = "";
  readyState = 0;
  status = 0;
  responseText = "";

  open(method: string, url: string, async = true) {
    this.method = method;
    this.url = url;
    FakeXMLHttpRequest.requests.push({ method, url, async });
    this.readyState = 1;
  }

  send() {
    if (FakeXMLHttpRequest.throwing.has(this.url)) throw new DOMException("Failed to execute 'send'", "NetworkError");
    const script = FakeXMLHttpRequest.scripts.get(this.url);
    this.status = script === undefined ? 404 : 200;
    this.responseText = script ?? "";
    this.readyState = 4;
  }
}

export type PageFetchCall = { url: string; init?: any; response: Response };

// Page fetch: records calls; `routes` maps a URL prefix to a response factory, anything else gets an empty 200.
export function createPageFetch(routes: Record<string, () => Response> = {}) {
  const calls: PageFetchCall[] = [];
  const fetch = async (input: any, init?: any) => {
    const url = typeof input === "string" ? input : String(input?.url ?? input);
    const prefix = Object.keys(routes).find((p) => url.startsWith(p));
    const response = prefix ? routes[prefix]() : new Response("");
    calls.push({ url, init, response });
    return response;
  };
  return { fetch, calls };
}

// chrome.storage.local / onChanged / runtime.getURL / runtime.getManifest
// `deferStorage`: storage.local.get callbacks wait for `flushStorage()`, like a slow storage backend at page start.
export function createChrome(initial: Record<string, any> = {}, { manifest = {}, deferStorage = false }: { manifest?: any; deferStorage?: boolean } = {}) {
  const data: Record<string, any> = { ...initial };
  const changeListeners: ((changes: Record<string, { oldValue?: any; newValue?: any }>, area: string) => void)[] = [];
  const getCalls: any[] = [];
  const pendingGets: (() => void)[] = [];

  return {
    data,
    getCalls,
    flushStorage: () => pendingGets.splice(0).forEach((run) => run()),
    storage: {
      local: {
        get(keys: string[] | string | null, callback: (items: Record<string, any>) => void) {
          getCalls.push(keys);
          const list = keys === null ? Object.keys(data) : Array.isArray(keys) ? keys : [keys];
          const items: Record<string, any> = {};
          for (const key of list) if (key in data) items[key] = data[key];
          if (deferStorage) pendingGets.push(() => callback(items));
          else callback(items);
        },
        set(items: Record<string, any>, callback?: () => void) {
          const changes: Record<string, { oldValue?: any; newValue?: any }> = {};
          for (const [key, value] of Object.entries(items)) {
            changes[key] = { oldValue: data[key], newValue: value };
            data[key] = value;
          }
          for (const listener of changeListeners) listener(changes, "local");
          callback?.();
        },
      },
      onChanged: {
        addListener(listener: (typeof changeListeners)[number]) {
          changeListeners.push(listener);
        },
      },
    },
    runtime: {
      getURL: (path: string) => `chrome-extension://purple-test/${path}`,
      getManifest: () => manifest,
    },
  };
}

type PageEnvOptions = {
  url?: string;
  chrome?: Record<string, any>;
  // extension manifest returned by chrome.runtime.getManifest()
  manifest?: any;
  deferStorage?: boolean;
  fetchRoutes?: Record<string, () => Response>;
};

export type PageEnv = {
  pageFetch: ReturnType<typeof createPageFetch>;
  chrome: ReturnType<typeof createChrome>;
  blobs: Map<string, Blob>;
  // text of a blob URL created by the page
  blobText: (url: string) => Promise<string>;
};

const GLOBAL_KEYS = ["Worker", "XMLHttpRequest", "fetch", "request", "chrome"] as const;

// Registers happy-dom and installs the fakes in beforeAll; restores them and unregisters happy-dom in afterAll.
export function usePageEnv(options: PageEnvOptions = {}): PageEnv {
  const env = {} as PageEnv;
  const saved = new Map<string, PropertyDescriptor | undefined>();
  let savedCreateObjectURL: any;

  beforeAll(() => {
    registerDom(options.url ?? DEFAULT_PAGE_URL);

    for (const key of GLOBAL_KEYS) saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));

    FakeWorker.instances = [];
    FakeXMLHttpRequest.scripts = new Map();
    FakeXMLHttpRequest.throwing = new Set();
    FakeXMLHttpRequest.requests = [];

    env.pageFetch = createPageFetch(options.fetchRoutes);
    env.chrome = createChrome(options.chrome, { manifest: options.manifest, deferStorage: options.deferStorage });
    env.blobs = new Map();
    env.blobText = (url: string) => env.blobs.get(url)!.text();

    const g = globalThis as any;
    g.Worker = FakeWorker;
    g.XMLHttpRequest = FakeXMLHttpRequest;
    g.fetch = env.pageFetch.fetch;
    g.chrome = env.chrome;

    savedCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = (blob: Blob) => {
      const url = `blob:${DEFAULT_PAGE_URL.split("/").slice(0, 3).join("/")}/purple-test-${env.blobs.size + 1}`;
      env.blobs.set(url, blob);
      return url;
    };
  });

  afterAll(async () => {
    URL.createObjectURL = savedCreateObjectURL;
    for (const key of GLOBAL_KEYS) {
      const descriptor = saved.get(key);
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete (globalThis as any)[key];
    }
    await unregisterDom();
  });

  return env;
}
