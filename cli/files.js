// Files of platform/src that go into the extension: everything except the tests next to the platform scripts.
export const isPackaged = (path) => !/\.spec\.ts$/.test(path);

// T-704: Purple's license and the third-party notices (TwitchAdSolutions' MIT notice) go into every package
export const NOTICES = ["LICENSE", "THIRD-PARTY-NOTICES.md"];

// T-701: dist/purple-adblock-<version>-<platform>.zip, and the unpacked build in dist/purple-adblock-<platform>
export const PACKAGE = "purple-adblock";
export const zipName = (platform, version) => `${PACKAGE}-${version}-${platform}.zip`;
export const unpackedName = (platform) => `${PACKAGE}-${platform}`;
