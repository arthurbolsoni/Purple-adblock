// Defaults in docs/feat.md ("Settings"). Fields after proxyUrl are optional: the userscript sends no settings, and
// the extension only stores the ones its popup or the tests set.
export type Setting = {
  whitelist: string[];
  toggleProxy: boolean;
  proxyUrl: string;
  debug?: boolean;
  backupPlayerTypes?: string[];
  lowQualityFallback?: boolean;
};
