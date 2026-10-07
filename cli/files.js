// Files of platform/src that go into the extension: everything except the tests next to the platform scripts.
export const isPackaged = (path) => !/\.spec\.ts$/.test(path);
