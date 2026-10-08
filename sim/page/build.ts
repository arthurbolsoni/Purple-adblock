// `bun install && bun run build` in sim/page: bundles the IVS player SDK into ivs.js (gitignored) for index.html.
const result = await Bun.build({ entrypoints: [import.meta.dir + "/entry.ts"], outdir: import.meta.dir, naming: "ivs.js", target: "browser", format: "iife" });
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
console.log("sim/page/ivs.js written");
