// T-010: the page and the workers it creates (index.ts, page/worker-registry.ts). A worker whose script Purple could
// download runs Purple's code ("injected"); it joins the registry with the page's first message to it (the player's
// own; nothing from Purple may come before, a setIntegrity sent first killed the player worker on twitch.tv), and then
// gets the newest of each message the page broadcasts, settings and quality among them. The page creates and deletes
// players in a worker; pause and play go to the first player created in it (C-13: not to the picture-by-picture one
// created later in the same worker), and once that one is deleted, to the next one created.
//
// The model does what the code does; page.int.spec.ts ("against the Quint model") replays its traces on index.ts.
module pageWorkers {
  pure val WORKERS = Set(1, 2)
  pure val IDS = Set(0, 1, 2)                    // player ids the page gives (the IVS SDK's 0, twitch.tv's 1, 2, ...)
  pure val SETTINGS = Set("s1", "s2")
  pure val QUALITIES = Set("q1", "q2")
  const MAX_STEPS: int

  // second: players created while the worker's main player was alive (the picture-by-picture ones, C-13)
  // mains: players that took pause and play in this worker (the first created, and each one created after its deletion);
  // lastMain: the one before the current one (-1: none)
  // settings, quality: the newest of each this worker got from Purple
  type Worker = {
    created: bool, injected: bool, started: bool, terminated: bool,
    playerId: int, playerCreated: bool,
    alive: Set[int], second: Set[int], mains: int, lastMain: int,
    settings: str, quality: str,
  }
  type Did = { name: str, worker: int, arg: str, id: int, value: str }
  // a message to a worker: the page's own (init, create, delete, with the player id), or Purple's (settings, quality
  // with their value; pause, play with the player id). Quint has no string operations, hence a record.
  type Msg = { name: str, value: str, id: int }

  var workers: int -> Worker
  var settings: str                              // the registry's newest setSettings
  var quality: str                               // and setQuality
  var steps: int
  var did: Did
  var sent: int -> List[Msg]                     // what each worker got at this step, in order
  var toSecondPlayer: bool                       // a pause or play went to a picture-by-picture player

  pure def none: Worker = {
    created: false, injected: false, started: false, terminated: false, playerId: 1, playerCreated: false,
    alive: Set(), second: Set(), mains: 0, lastMain: -1, settings: "", quality: "",
  }
  def registered(w: Worker): bool = w.injected and w.started and not(w.terminated)
  pure def nothing: int -> List[Msg] = WORKERS.mapBy(_ => List())
  pure def purple(name: str, value: str): Msg = { name: name, value: value, id: -1 }

  // the trace starts once the page has set settings s0 and quality q0 (page.int.spec.ts)
  action init = all {
    workers' = WORKERS.mapBy(_ => none), settings' = "s0", quality' = "q0", steps' = 0,
    did' = { name: "init", worker: 0, arg: "", id: 0, value: "" }, sent' = nothing, toSecondPlayer' = false,
  }

  // the player creates a worker; Purple's code runs in it when Purple could download its script
  action create(w: int, how: str): bool = all {
    not(workers.get(w).created), steps < MAX_STEPS,
    workers' = workers.set(w, { ...none, created: true, injected: how == "injected" }),
    settings' = settings, quality' = quality, steps' = steps + 1,
    did' = { name: "create", worker: w, arg: how, id: 0, value: "" }, sent' = nothing, toSecondPlayer' = toSecondPlayer,
  }

  // the page posts to a worker: "init" (the player's first message), "create" or "delete" a player. The first message
  // to an injected worker adds it to the registry, which sends it the newest settings, then quality.
  action page(w: int, kind: str, id: int): bool = {
    val x = workers.get(w)
    val first = x.injected and not(x.started)
    val created = kind == "create" and not(x.playerCreated)
    val message = { name: kind, value: "", id: id }
    all {
      x.created, not(x.terminated), steps < MAX_STEPS,
      // the page numbers its players one after the other and deletes each once: no create under the id of a living one
      // (soak e, f and g: the picture-by-picture players took the ids 2 to 7 in turn, each deleted before its id came again)
      kind != "create" or not(x.alive.contains(id)),
      workers' = workers.set(w, {
        ...x,
        playerId: if (created) id else x.playerId,
        mains: if (created) x.mains + 1 else x.mains,
        lastMain: if (created and x.mains > 0) x.playerId else x.lastMain,
        playerCreated: if (created) true else if (kind == "delete" and id == x.playerId) false else x.playerCreated,
        alive: if (kind == "create") x.alive.union(Set(id)) else if (kind == "delete") x.alive.exclude(Set(id)) else x.alive,
        second: if (kind == "create" and x.playerCreated and id != x.playerId) x.second.union(Set(id))
                else if (kind == "delete") x.second.exclude(Set(id)) else x.second,
        started: x.started or x.injected,
        settings: if (first) settings else x.settings,
        quality: if (first) quality else x.quality,
      }),
      settings' = settings, quality' = quality, steps' = steps + 1,
      did' = { name: "page", worker: w, arg: kind, id: id, value: "" },
      sent' = nothing.set(w, if (first) List(message, purple("settings", settings), purple("quality", quality)) else List(message)),
      toSecondPlayer' = toSecondPlayer,
    }
  }

  // the content script's setSettings: to every worker in the registry
  action setSettings(value: str): bool = all {
    steps < MAX_STEPS,
    workers' = WORKERS.mapBy(w => if (registered(workers.get(w))) { ...workers.get(w), settings: value } else workers.get(w)),
    settings' = value, quality' = quality, steps' = steps + 1,
    did' = { name: "setSettings", worker: 0, arg: value, id: 0, value: "" },
    sent' = WORKERS.mapBy(w => if (registered(workers.get(w))) List(purple("settings", value)) else List()),
    toSecondPlayer' = toSecondPlayer,
  }

  // Purple's code in a worker posts to the page: pause or play (answered to that worker, by the id it keeps), or a
  // quality change (to every worker in the registry). Messages from it before the page's first one are not answered.
  action emit(w: int, kind: str, value: str): bool = {
    val x = workers.get(w)
    all {
      x.created, x.injected, not(x.terminated), steps < MAX_STEPS,
      if (kind == "quality") all {
        workers' = WORKERS.mapBy(v => if (registered(workers.get(v))) { ...workers.get(v), quality: value } else workers.get(v)),
        quality' = value,
        sent' = WORKERS.mapBy(v => if (registered(workers.get(v))) List(purple("quality", value)) else List()),
        toSecondPlayer' = toSecondPlayer,
      } else all {
        workers' = workers, quality' = quality,
        sent' = nothing.set(w, if (x.started) List({ name: kind, value: "", id: x.playerId }) else List()),
        toSecondPlayer' = (toSecondPlayer or (x.started and x.second.contains(x.playerId))),
      },
      settings' = settings, steps' = steps + 1,
      did' = { name: "emit", worker: w, arg: kind, id: 0, value: value },
    }
  }

  action terminate(w: int): bool = all {
    workers.get(w).created, not(workers.get(w).terminated), steps < MAX_STEPS,
    workers' = workers.set(w, { ...workers.get(w), terminated: true }),
    settings' = settings, quality' = quality, steps' = steps + 1,
    did' = { name: "terminate", worker: w, arg: "", id: 0, value: "" }, sent' = nothing, toSecondPlayer' = toSecondPlayer,
  }

  action step = {
    nondet w = WORKERS.oneOf()
    nondet how = Set("injected", "plain").oneOf()
    nondet kind = Set("init", "create", "delete").oneOf()
    nondet id = IDS.oneOf()
    nondet value = SETTINGS.oneOf()
    nondet emitted = Set("pause", "play", "quality").oneOf()
    nondet q = QUALITIES.oneOf()
    any { create(w, how), page(w, kind, id), setSettings(value), emit(w, emitted, q), terminate(w) }
  }

  // what should hold
  val newestSettings = WORKERS.forall(w => registered(workers.get(w)) implies workers.get(w).settings == settings)
  val newestQuality = WORKERS.forall(w => registered(workers.get(w)) implies workers.get(w).quality == quality)
  val notToSecondPlayer = not(toSecondPlayer)
  val nothingToTerminated = WORKERS.forall(w => workers.get(w).terminated implies sent.get(w).length() == 0 or did.name == "page")

  // paths the replay must go through
  val neverLateWorker = not(did.name == "page" and sent.get(did.worker).length() == 3 and settings != "s0")
  val neverSecondPlayer = WORKERS.forall(w => workers.get(w).second.size() == 0)
  val neverMainPlayerDeleted = not(did.name == "page" and did.arg == "delete" and did.id == workers.get(did.worker).playerId and not(workers.get(did.worker).playerCreated))
  val neverNextPlayerTakesOver = not(did.name == "page" and did.arg == "create" and did.id != 1 and workers.get(did.worker).playerId == did.id and workers.get(did.worker).playerCreated)
  val neverPauseBeforeStart = not(did.name == "emit" and did.arg != "quality" and sent.get(did.worker).length() == 0)
  val neverPlainWorker = not(did.name == "page" and not(workers.get(did.worker).injected))
  val neverBroadcastAfterTerminate = not((did.name == "setSettings" or did.arg == "quality") and WORKERS.exists(w => workers.get(w).terminated))
  val neverQualityToBoth = not(did.arg == "quality" and WORKERS.forall(w => sent.get(w).length() == 1))
  // pause or play while a picture-by-picture player lives: to the main one
  val neverPauseBesidePicture = not(did.name == "emit" and did.arg != "quality" and sent.get(did.worker).length() == 1 and workers.get(did.worker).second.size() > 0)
  // pause or play once a player created after the main one's deletion, under another id, took over
  val neverPauseAfterTakeover = not(
    did.name == "emit" and did.arg != "quality" and sent.get(did.worker).length() == 1 and workers.get(did.worker).mains > 1 and
    workers.get(did.worker).playerId != workers.get(did.worker).lastMain
  )
  // the main player deleted while a picture-by-picture one lives, then a new one created: it is the main one now
  val neverMainRecreatedBesidePicture = not(did.name == "page" and did.arg == "create" and workers.get(did.worker).playerId == did.id and workers.get(did.worker).second.size() > 0)
  // pause or play while the main player is deleted: to its id, which no player has (lost until the page creates one)
  val neverPauseToDeletedPlayer = not(did.name == "emit" and did.arg != "quality" and sent.get(did.worker).length() == 1 and not(workers.get(did.worker).alive.contains(workers.get(did.worker).playerId)))
}

module simulation {
  import pageWorkers(MAX_STEPS = 30).*
}

module exhaustive {
  import pageWorkers(MAX_STEPS = 9).*
}
