import { plugin } from "bun";
import { join } from "path";

// index.ts imports the built worker with Vite's `?raw` suffix. Under bun test it resolves to a stub module
// exporting a fixed string; tests import the same stub to compare against it.
const STUB = join(import.meta.dir, "stubs", "worker-bundle.ts");

plugin({
  name: "raw-suffix",
  setup(build) {
    build.onResolve({ filter: /\?raw$/ }, () => ({ path: STUB }));
  },
});
