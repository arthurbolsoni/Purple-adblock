import type { PageGql } from "./modules/twitch/page-gql";

// What the worker code needs from the scope it runs in. In the browser it is the player worker's `self`;
// in tests it is a fake built by `test/harness/worker-scope.ts`.
export interface WorkerContext {
  request: (input: any, init?: any) => Promise<Response>; // original fetch, skips the hook
  postMessage: (message: any) => void; // worker -> page
  logger: (...args: any[]) => void; // prints only with `debug` on (C-09)
  debug?: boolean; // the `debug` setting
  diagnostics?: boolean; // the `diagnostics` setting (F-31); undefined until the first setSettings: on
  // event for the page: window.__purple.events with `debug` on (F-17), the diagnostic log with `diagnostics` on (F-31)
  emit?: (event: PurpleEvent) => void;
  gqlHeaders?: Record<string, string>; // headers of the page's GQL requests, for backup token requests (F-05, T-401)
  pageGql?: PageGql; // GQL requests executed by the page (F-06, T-402)
}

// F-17. csaiBlocked (T-301) is recorded by the page, the others come from the worker.
// F-31 (T-606): channelLoaded (the usher request of a channel), adPassed, error, backupTried (a backup type's outcome in
// a poll or its token request), requestFailed, playlistClean (the first playlist of a break with no ad segment left) and
// tokenFlags (the ad flags of the page's own access token) feed the page's diagnostic log
export type PurpleEvent = {
  type: "adDetected" | "backupUsed" | "segmentsReplaced" | "blankInserted" | "csaiBlocked" | "whitelisted" | "reloadRequested" | "playerReloaded" | "backupsPrewarmed" | "sequenceShifted" | "sequenceRestart" | "segmentRepeat" | "backupBehind" | "channelLoaded" | "adPassed" | "error" | "backupTried" | "requestFailed" | "playlistClean" | "tokenFlags";
  channel: string;
  playerType?: string;
  count?: number; // sequenceShifted: the shift added to the backup's MEDIA-SEQUENCE (F-23); sequenceRestart: how far the numbers went back (F-24); segmentRepeat: the live segments the player would have fetched again (F-28); adPassed: ad segments the player got, not counted before (F-31)
  quality?: string; // backupUsed: quality of the backup variant (T-407)
  ok?: boolean; // playerReloaded: the page found the player and reloaded it (T-601)
  name?: string; // error: the exception's name, never its message (F-31)
  where?: "playlist" | "usher"; // error: the route whose logic threw (F-31)
  outcome?: BackupOutcome; // backupTried (F-31)
  status?: number; // backupTried with outcome "status", requestFailed: the HTTP status, 0 for a network error or nothing to send (F-31)
  what?: "token" | "usher" | "playlist" | "integrity"; // requestFailed: the request (F-31)
  flags?: { hideAds?: boolean; showAds?: boolean; serverAds?: boolean; adblock?: boolean }; // tokenFlags (F-31)
};

// F-31: what one backup type gave: a playlist without ads, one with ads (or its own break announced), one behind the
// player (F-25), no master to ask (no token yet, or its usher request gave none), no token, or a failed playlist request
export type BackupOutcome = "clean" | "ads" | "behind" | "noMaster" | "noToken" | "status";

// F-17, F-31: the worker posts its events to the page with `debug` on, or while `diagnostics` is not off
export const eventsOn = (context: Pick<WorkerContext, "debug" | "diagnostics">) => context.debug === true || context.diagnostics !== false;

export interface WorkerScope extends Partial<WorkerContext> {
  fetch: (input: any, init?: any) => Promise<Response>;
  postMessage: (message: any) => void;
  addEventListener: (type: "message", listener: (event: any) => void) => void;
  appController?: any;
}
