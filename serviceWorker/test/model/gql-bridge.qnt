// T-010: the worker's GQL requests run by the page (F-06, T-402): modules/twitch/page-gql.ts in the worker,
// page/gql-bridge.ts in the page. Before the page offers the bridge (setGqlBridge) a request goes from the worker;
// after, the worker posts it with an id and waits for the page's answer, matched by id; with no answer within 5 s, or a
// failed one (status 0), it sends the request itself, and a late answer is ignored.
//
// The model does what the code does; gql-bridge-model.int.spec.ts replays its traces on the real PageGql and
// runGqlRequest. Up to three requests (token requests for several backup types at once).
module gqlBridge {
  pure val TIMEOUT_MS = 5000          // PAGE_GQL_TIMEOUT_MS
  pure val REQUESTS = Set(1, 2, 3)
  pure val GAPS = Set(1000, 4000, 5000)
  pure val OUTCOMES = Set("ok", "fail")   // the page's fetch answered, or threw (status 0)
  const MAX_STEPS: int

  // a request of the worker: unsent, waiting for the page's answer, or done (answered by the page, or sent directly)
  type Request = { state: str, id: int, sentAt: int, source: str, answerId: int, resolutions: int, directs: int }
  type Did = { name: str, request: int, id: int, outcome: str, gap: int }

  var now: int
  var steps: int
  var bridged: bool                   // PageGql.enabled
  var nextId: int                     // PageGql.next
  var requests: int -> Request
  var page: int -> str                // id -> "running" | "answered": the requests the page runs
  var did: Did

  pure def unsent: Request = { state: "unsent", id: 0, sentAt: 0, source: "", answerId: 0, resolutions: 0, directs: 0 }
  pure def direct(r: Request): Request = { ...r, state: "done", source: "direct", resolutions: r.resolutions + 1, directs: r.directs + 1 }

  action init = all {
    now' = 0, steps' = 0, bridged' = false, nextId' = 1,
    requests' = REQUESTS.mapBy(_ => unsent),
    page' = REQUESTS.mapBy(_ => ""),
    did' = { name: "init", request: 0, id: 0, outcome: "", gap: 0 },
  }

  // the page offers the bridge (setGqlBridge, replayed to workers created later)
  action enable = all {
    not(bridged), steps < MAX_STEPS,
    now' = now, steps' = steps + 1, bridged' = true, nextId' = nextId, requests' = requests, page' = page,
    did' = { name: "enable", request: 0, id: 0, outcome: "", gap: 0 },
  }

  // the worker asks: through the page with the next id, or directly before the bridge
  action request(r: int): bool = all {
    requests.get(r).state == "unsent", steps < MAX_STEPS,
    now' = now, steps' = steps + 1, bridged' = bridged,
    if (bridged) all {
      nextId' = nextId + 1,
      requests' = requests.set(r, { ...unsent, state: "waiting", id: nextId, sentAt: now }),
      page' = page.set(nextId, "running"),
    } else all {
      nextId' = nextId, requests' = requests.set(r, direct(unsent)), page' = page,
    },
    did' = { name: "request", request: r, id: if (bridged) nextId else 0, outcome: "", gap: 0 },
  }

  // the page's fetch for request `id` ends and its answer reaches the worker: a request still waiting takes it (status
  // 0 sends it directly); one done already (timed out) ignores it
  action pageAnswer(id: int, outcome: str): bool = all {
    page.get(id) == "running", steps < MAX_STEPS,
    now' = now, steps' = steps + 1, bridged' = bridged, nextId' = nextId,
    page' = page.set(id, "answered"),
    requests' = REQUESTS.mapBy(r => {
      val q = requests.get(r)
      if (q.id == id and q.state == "waiting")
        if (outcome == "ok") { ...q, state: "done", source: "page", answerId: id, resolutions: q.resolutions + 1 }
        else direct(q)
      else q
    }),
    did' = { name: "answer", request: 0, id: id, outcome: outcome, gap: 0 },
  }

  // time passes: a request waiting TIMEOUT_MS is sent directly
  action advance(gap: int): bool = all {
    steps < MAX_STEPS,
    now' = now + gap, steps' = steps + 1, bridged' = bridged, nextId' = nextId, page' = page,
    requests' = REQUESTS.mapBy(r => {
      val q = requests.get(r)
      if (q.state == "waiting" and q.sentAt + TIMEOUT_MS <= now + gap) direct(q) else q
    }),
    did' = { name: "advance", request: 0, id: 0, outcome: "", gap: gap },
  }

  action step = {
    nondet r = REQUESTS.oneOf()
    nondet id = REQUESTS.oneOf()
    nondet outcome = OUTCOMES.oneOf()
    nondet gap = GAPS.oneOf()
    any { enable, request(r), pageAnswer(id, outcome), advance(gap) }
  }

  // what should hold
  val answeredOnce = REQUESTS.forall(r => requests.get(r).resolutions <= 1)
  val sentDirectlyOnce = REQUESTS.forall(r => requests.get(r).directs <= 1)
  val ownAnswer = REQUESTS.forall(r => requests.get(r).source == "page" implies requests.get(r).answerId == requests.get(r).id)
  val noLongWait = REQUESTS.forall(r => requests.get(r).state == "waiting" implies now - requests.get(r).sentAt < TIMEOUT_MS)

  // paths the replay must go through
  val neverDirectBeforeBridge = not(did.name == "request" and did.id == 0)
  val neverPageAnswer = not(REQUESTS.exists(r => requests.get(r).source == "page"))
  val neverFallbackOnFailure = not(did.name == "answer" and did.outcome == "fail" and REQUESTS.exists(r => requests.get(r).id == did.id and requests.get(r).source == "direct"))
  val neverTimeout = not(did.name == "advance" and REQUESTS.exists(r => requests.get(r).id > 0 and requests.get(r).source == "direct" and requests.get(r).answerId == 0 and page.get(requests.get(r).id) == "running"))
  val neverLateAnswer = not(did.name == "answer" and REQUESTS.exists(r => requests.get(r).id == did.id and requests.get(r).answerId != did.id and requests.get(r).source == "direct" and did.outcome == "ok"))
  val neverOutOfOrder = not(did.name == "answer" and REQUESTS.exists(r => requests.get(r).state == "waiting" and requests.get(r).id < did.id))
  val neverAtTheTimeout = not(did.name == "advance" and REQUESTS.exists(r => requests.get(r).state == "done" and requests.get(r).source == "direct" and requests.get(r).id > 0 and page.get(requests.get(r).id) == "running" and now - requests.get(r).sentAt == TIMEOUT_MS))
}

module simulation {
  import gqlBridge(MAX_STEPS = 30).*
}

module exhaustive {
  import gqlBridge(MAX_STEPS = 12).*
}
