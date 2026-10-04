// What the worker code needs from the scope it runs in. In the browser it is the player worker's `self`;
// in tests it is a fake built by `test/harness/worker-scope.ts`.
export interface WorkerContext {
  request: (input: any, init?: any) => Promise<Response>; // original fetch, skips the hook
  postMessage: (message: any) => void; // worker -> page
  logger: (...args: any[]) => void;
}

export interface WorkerScope extends Partial<WorkerContext> {
  fetch: (input: any, init?: any) => Promise<Response>;
  postMessage: (message: any) => void;
  addEventListener: (type: "message", listener: (event: any) => void) => void;
  appController?: any;
}
