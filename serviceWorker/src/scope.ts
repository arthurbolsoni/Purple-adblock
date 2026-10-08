// What the worker code needs from the scope it runs in. In the browser it is the player worker's `self`;
// in tests it is a fake built by `test/harness/worker-scope.ts`.
export interface WorkerContext {
  request: (input: any, init?: any) => Promise<Response>; // original fetch, skips the hook
  postMessage: (message: any) => void; // worker -> page
  logger: (...args: any[]) => void; // prints only with `debug` on (C-09)
  debug?: boolean; // the `debug` setting
  emit?: (event: PurpleEvent) => void; // debug event for window.__purple.events, posted only with `debug` on (F-17)
  gqlHeaders?: Record<string, string>; // headers of the page's GQL requests, for backup token requests (F-05, T-401)
}

// F-17. csaiBlocked (T-301) is recorded by the page, the others come from the worker.
export type PurpleEvent = {
  type: "adDetected" | "backupUsed" | "segmentsReplaced" | "blankInserted" | "csaiBlocked" | "whitelisted";
  channel: string;
  playerType?: string;
  count?: number;
  quality?: string; // backupUsed: quality of the backup variant (T-407)
};

export interface WorkerScope extends Partial<WorkerContext> {
  fetch: (input: any, init?: any) => Promise<Response>;
  postMessage: (message: any) => void;
  addEventListener: (type: "message", listener: (event: any) => void) => void;
  appController?: any;
}
