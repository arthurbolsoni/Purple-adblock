// T-010: runs Quint on the models in this folder, on demand (not part of `bun run check`).
//   bun run model:traces [model...]   random traces, one per invariant a model breaks and one per path the replay must
//                                     go through, into traces/<model>.json for the replays in test/integration/
//   bun run model:check [model...]    each invariant against random runs (module simulation); prints the steps that
//                                     break one. No fixed seed, so the simulator uses every core; a failure prints it.
//   bun run model:verify [model...]   each invariant against every state of module exhaustive (TLC, Java 21 or later)
// Quint comes through bunx at the version below (Node; its simulator is a binary it downloads into ~/.quint, and
// `verify` uses the Apalache it downloads there too, whose jar carries TLC).
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { homedir, tmpdir } from "os";
import { join } from "path";

const QUINT = "@informalsystems/quint@0.33.1";
const SEED = "20261108";

type Model = {
  file: string;
  // what should hold, and the task of the fault that breaks it today ("" when none does)
  invariants: Record<string, string>;
  // the module `verify` runs an invariant in, when not `exhaustive`
  verifyIn?: Record<string, string>;
  // paths the replay must go through (the model's never* values): one trace that reaches each
  paths: string[];
  random: { traces: number; steps: number };
  // one state as the replay reads it
  compact: (state: any) => unknown;
};

const MODELS: Record<string, Model> = {
  // Player's poll logic and its backup tokens (player.qnt; player-model.int.spec.ts). One array per state:
  //   [action, poll, answer, now, live, pageAhead, adStart, polls in flight,
  //    delivered: [newest, recorded source (0: the page's, t: token t's), restart, newestLive] or 0,
  //    player: [have, haveLive, repeated, waiting, missed],
  //    the step's token: [id, lag, offset], the frontpage server's token (-1: none), a token request in flight]
  player: {
    file: "player.qnt",
    invariants: { recordedIsDelivered: "T-831", noWait: "T-831", noRepeat: "T-832", noMiss: "", serverOrToken: "" },
    verifyIn: { noMiss: "exhaustiveMiss", serverOrToken: "exhaustiveTokens" },
    paths: [
      "neverSequenceBack",
      "neverRepeatRestart",
      "neverRepeatByOne",
      "neverSkipped",
      "neverNoServer",
      "neverMerged",
      "neverBlank",
      "neverAnswerWhileOtherWaits",
      "neverTokenReplacesServer",
      "neverAnswerFromOldToken",
      "neverTokenOnPageBase",
      "neverSwitchBetweenTokens",
    ],
    random: { traces: 15, steps: 60 },
    compact: (s) => [
      s.did.name,
      s.did.poll,
      s.did.answer,
      s.now,
      s.live,
      s.pageAhead,
      s.adStart,
      Object.entries(s.polls).filter(([, p]: any) => p.waiting).map(([id]) => Number(id)),
      s.obs.delivered ? [s.obs.newest, s.obs.recorded, s.obs.restart ? 1 : 0, s.obs.newestLive] : 0,
      [s.have, s.haveLive, s.repeated ? 1 : 0, s.waiting ? 1 : 0, s.missed ? 1 : 0],
      [s.did.token, s.did.lag, s.did.offset],
      s.server,
      s.tokenPending ? 1 : 0,
    ],
  },
  // AdBreak (ad-break.qnt; ad-break-model.int.spec.ts): [action, ads, gap, setting, state, called]
  "ad-break": {
    file: "ad-break.qnt",
    invariants: { oneReloadPerBreak: "", reloadsCooledDown: "", oneActionPerEdge: "" },
    paths: ["neverReload", "neverPauseAtEnd", "neverBackToIdle", "neverAdsAgainWhileRecovering", "neverReloadTurnedDownByCooldown", "neverReloadAtCooldown", "neverIdleAtRecovering"],
    random: { traces: 10, steps: 30 },
    compact: (s) => [s.did.name, s.did.ads ? 1 : 0, s.did.gap, s.did.setting ? 1 : 0, s.state, s.called],
  },
  // the worker's GQL requests through the page (gql-bridge.qnt; gql-bridge-model.int.spec.ts):
  //   [action, request, id, outcome, gap, [[state, id, source, answerId, directs] for requests 1 to 3]]
  "gql-bridge": {
    file: "gql-bridge.qnt",
    invariants: { answeredOnce: "", sentDirectlyOnce: "", ownAnswer: "", noLongWait: "" },
    paths: ["neverDirectBeforeBridge", "neverPageAnswer", "neverFallbackOnFailure", "neverTimeout", "neverLateAnswer", "neverOutOfOrder", "neverAtTheTimeout"],
    random: { traces: 10, steps: 30 },
    compact: (s) => [s.did.name, s.did.request, s.did.id, s.did.outcome, s.did.gap, [1, 2, 3].map((r) => [s.requests[r].state, s.requests[r].id, s.requests[r].source, s.requests[r].answerId, s.requests[r].directs])],
  },
  // the page and its workers (page-workers.qnt; page.int.spec.ts, "against the Quint model"):
  //   [action, worker, arg, id, value, [[name, value, id] sent to worker 1], [... to worker 2]]
  "page-workers": {
    file: "page-workers.qnt",
    invariants: { newestSettings: "", newestQuality: "", notToSecondPlayer: "", nothingToTerminated: "" },
    paths: [
      "neverLateWorker",
      "neverSecondPlayer",
      "neverMainPlayerDeleted",
      "neverNextPlayerTakesOver",
      "neverPauseBeforeStart",
      "neverPlainWorker",
      "neverBroadcastAfterTerminate",
      "neverQualityToBoth",
      "neverMainRecreatedBesidePicture",
      "neverPauseToDeletedPlayer",
      "neverPauseBesidePicture",
      "neverPauseAfterTakeover",
    ],
    random: { traces: 10, steps: 30 },
    compact: (s) => [s.did.name, s.did.worker, s.did.arg, s.did.id, s.did.value, ...[1, 2].map((w) => s.sent[w].map((m: any) => [m.name, m.value, m.id]))],
  },
};

// one run of the simulator; with a seed it runs on one core, so model:traces starts its runs together
async function quint(model: Model, args: string[], seed: string[] = ["--seed", SEED]) {
  const run = Bun.spawn(["bunx", QUINT, "run", "--main=simulation", join(import.meta.dir, model.file), ...seed, ...args], { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr] = await Promise.all([new Response(run.stdout).text(), new Response(run.stderr).text(), run.exited]);
  return { violated: stdout.includes("[violation]"), output: stdout + stderr };
}

// ITF (Apalache's trace format): integers as {"#bigint"}, maps as {"#map": [[key, value]]}
const decode = (value: any): any => {
  if (Array.isArray(value)) return value.map(decode);
  if (value && typeof value === "object") {
    if ("#bigint" in value) return Number(value["#bigint"]);
    if ("#map" in value) return Object.fromEntries(value["#map"].map(([k, v]: any) => [decode(k), decode(v)]));
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, decode(v)]));
  }
  return value;
};

// variables come as <module>::<model>::<name> from the module that instantiates the model
function readTrace(model: Model, name: string, file: string) {
  const unqualified = (state: any) => Object.fromEntries(Object.entries(state).map(([key, value]) => [key.split("::").pop(), value]));
  const states = JSON.parse(readFileSync(file, "utf8")).states.map((state: any) => decode(unqualified(state)));
  return { name, states: states.map(model.compact) };
}

async function traces(name: string, model: Model) {
  const dir = mkdtempSync(join(tmpdir(), "quint-"));
  try {
    const { traces: count, steps } = model.random;
    const witness = (invariant: string, file: string) => quint(model, ["--invariant", invariant, "--max-samples", "20000", "--max-steps", "80", "--out-itf", join(dir, file)]);
    // every run at once: each has its seed, so the traces are the same as one after another
    const [, invariants, paths] = await Promise.all([
      quint(model, ["--max-samples", String(count), "--n-traces", String(count), "--max-steps", String(steps), "--out-itf", join(dir, "random_{seq}.itf.json")]),
      Promise.all(Object.keys(model.invariants).map((invariant) => witness(invariant, `witness_${invariant}.itf.json`))),
      Promise.all(model.paths.map((path) => witness(path, `path_${path}.itf.json`))),
    ]);
    const out = readdirSync(dir)
      .filter((file) => file.startsWith("random_"))
      .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
      .map((file) => readTrace(model, file.replace(".itf.json", ""), join(dir, file)));
    Object.entries(model.invariants).forEach(([invariant, task], i) => {
      if (invariants[i].violated) out.push(readTrace(model, `breaks ${invariant}${task ? ` (${task})` : ""}`, join(dir, `witness_${invariant}.itf.json`)));
    });
    model.paths.forEach((path, i) => {
      if (paths[i].violated) out.push(readTrace(model, `reaches ${path.replace(/^never/, "")}`, join(dir, `path_${path}.itf.json`)));
      else console.log(`${name}: no trace reaches ${path.replace(/^never/, "")}`);
    });
    mkdirSync(join(import.meta.dir, "traces"), { recursive: true });
    const target = join(import.meta.dir, "traces", `${name}.json`);
    writeFileSync(target, "[\n" + out.map((t) => JSON.stringify(t)).join(",\n") + "\n]\n");
    console.log(`${name}: ${out.length} traces, ${out.reduce((n, t) => n + t.states.length, 0)} states -> ${target}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function check(name: string, model: Model, samples: string) {
  let broken = 0;
  // one after another: without a seed each run already uses every core
  for (const [invariant, task] of Object.entries(model.invariants)) {
    const result = await quint(model, ["--invariant", invariant, "--max-samples", samples, "--max-steps", "80", "--verbosity", "3"], []);
    console.log(`${name} ${invariant}: ${result.violated ? `broken${task ? ` (${task})` : ""}` : "holds in the runs"}`);
    if (result.violated) {
      broken++;
      console.log(result.output.split("\n").filter((line) => !line.startsWith("Use ")).join("\n"));
    }
  }
  return broken;
}

async function verify(name: string, model: Model) {
  // TLC keeps its states in the temporary directory: one on disk, not /tmp (a RAM disk on some machines)
  const states = join(homedir(), ".cache", "purple-quint-tlc");
  mkdirSync(states, { recursive: true });
  let broken = 0;
  for (const [invariant, task] of Object.entries(model.invariants)) {
    const started = Date.now();
    const run = Bun.spawn(["bunx", QUINT, "verify", `--main=${model.verifyIn?.[invariant] ?? "exhaustive"}`, "--backend=tlc", join(import.meta.dir, model.file), "--invariant", invariant, "--verbosity", "3"], {
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, TMPDIR: states },
    });
    // TLC's Progress lines (states generated, distinct, queue) go to the console as they come, one a minute
    let output = "";
    let lastProgress = 0;
    const drain = async (stream: ReadableStream<Uint8Array>) => {
      for await (const chunk of stream) {
        const text = new TextDecoder().decode(chunk);
        output += text;
        for (const line of text.split("\n")) {
          if (line.startsWith("Progress") && Date.now() - lastProgress > 60_000) {
            lastProgress = Date.now();
            console.log(`  ${name} ${invariant}: ${line}`);
          }
        }
      }
    };
    await Promise.all([drain(run.stdout), drain(run.stderr)]);
    await run.exited;
    const counts = output.split("\n").filter((line) => /states generated|depth of the complete/.test(line));
    const violated = output.includes("found a counterexample");
    console.log(`${name} ${invariant}: ${violated ? `broken${task ? ` (${task})` : ""}` : run.exitCode === 0 ? "holds in every state" : "TLC failed"} in ${Math.round((Date.now() - started) / 1000)} s; ${counts.join("; ")}`);
    if (violated || run.exitCode !== 0) {
      broken++;
      console.log(output.split("\n").filter((line) => !/protobuf|^Running|^Semantic|^Starting|^Computing|^Progress|^Checking/.test(line)).join("\n"));
    }
  }
  return broken;
}

const [command, ...rest] = process.argv.slice(2);
const samples = rest.find((arg) => /^\d+$/.test(arg)) ?? "20000";
const names = rest.filter((arg) => !/^\d+$/.test(arg));
for (const name of names) if (!MODELS[name]) throw new Error(`no model ${name}; the models: ${Object.keys(MODELS).join(", ")}`);
const chosen = Object.entries(MODELS).filter(([name]) => !names.length || names.includes(name));

if (command === "traces") for (const [name, model] of chosen) await traces(name, model);
else if (command === "check") {
  let broken = 0;
  for (const [name, model] of chosen) broken += await check(name, model, samples);
  process.exit(broken ? 1 : 0);
} else if (command === "verify") {
  let broken = 0;
  for (const [name, model] of chosen) broken += await verify(name, model);
  process.exit(broken ? 1 : 0);
}
else {
  console.log(`usage: bun serviceWorker/test/model/quint.ts traces|check [samples]|verify [${Object.keys(MODELS).join(" ")}]`);
  process.exit(2);
}
