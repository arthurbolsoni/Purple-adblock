// Files of platform/src that go into the extension: everything except the tests next to the platform scripts.
export const isPackaged = (path) => !/\.spec\.ts$/.test(path);

// T-701: dist/purple-adblock-<version>-<platform>.zip, and the unpacked build in dist/purple-adblock-<platform>
export const PACKAGE = "purple-adblock";
export const zipName = (platform, version) => `${PACKAGE}-${version}-${platform}.zip`;
export const unpackedName = (platform) => `${PACKAGE}-${platform}`;
