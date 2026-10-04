import { plugin } from "bun";

// index.ts imports the built worker with Vite's `?raw` suffix. Under bun test it resolves to a fixed string.
export const WORKER_BUNDLE_STUB = "/* worker bundle stub */";

plugin({
  name: "raw-suffix",
  setup(build) {
    build.onResolve({ filter: /\?raw$/ }, (args) => ({ path: args.path, namespace: "raw" }));
    build.onLoad({ filter: /.*/, namespace: "raw" }, () => ({
      contents: `export default ${JSON.stringify(WORKER_BUNDLE_STUB)};`,
      loader: "js",
    }));
  },
});
