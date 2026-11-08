// Property tests (fast-check, T-010): every run of `bun test` uses the same seed, so the checks before a commit see the
// same cases. Longer runs pick the seed and the number of cases:
//   FC_SEED=random FC_RUNS=5000 bun test --timeout 600000 .prop.spec
// A failure prints its seed and path; FC_SEED=<seed> repeats it.
import fc from "fast-check";

const seed = process.env.FC_SEED === "random" ? (Math.random() * 2 ** 31) | 0 : Number(process.env.FC_SEED ?? 20261108);

fc.configureGlobal({ seed, numRuns: Number(process.env.FC_RUNS ?? 100) });

export { fc };
