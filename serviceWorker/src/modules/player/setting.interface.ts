// Defaults in docs/feat.md ("Settings"). Fields after proxyUrl are optional: the userscript sends no settings, and
// the extension only stores the ones its popup or the tests set.
export type Setting = {
  whitelist: string[];
  toggleProxy: boolean;
  proxyUrl: string;
  debug?: boolean;
  backupPlayerTypes?: string[];
  lowQualityFallback?: boolean;
  pinBackupPlayerType?: boolean;
  stripFallback?: boolean;
  forcePopoutToken?: boolean;
  reloadAfterAd?: boolean;
  pausePlayDelayMs?: number;
  prewarmBackups?: boolean;
  stripAdMarkers?: boolean;
  pausePlayOnBreaks?: boolean;
  prewarmAtLoad?: boolean;
  alignBackupSequence?: boolean;
  alignByLiveSequence?: boolean;
  restartOnSequenceBack?: boolean;
  restartOnRepeat?: boolean;
  skipBackupBehind?: boolean;
  parallelBackupFetch?: boolean;
  // read in the page (F-04); the worker counts a client-side break as blocked with it (F-30)
  blockCsai?: boolean;
  // F-29: read by the page (index.ts), not by the worker
  widenBufferRemovals?: boolean;
  // F-31: the diagnostic log (default on); the worker posts its events for it, the page writes the entries
  diagnostics?: boolean;
};
