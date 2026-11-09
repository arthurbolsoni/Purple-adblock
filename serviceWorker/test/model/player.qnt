// T-010: Player's poll logic (player.ts: onFetch, playlistFor, alignSequence F-23/F-27, F-10's contamination,
// followSequence F-24/F-28) and its backup tokens (stream.ts: createStreamAccess, one request in flight per type; the new
// master replaces the type's server), against Twitch's numbering (B-034, B-048, B-054) and a player that asks for the
// number after the last one it fetched. One backup type (frontpage); polls of the page's playlist, one after the other:
// each starts after the one before it gave its playlist (T-831, onFetch's turns; the backup answers within MAX_WAIT
// segments, under POLL_TURN_MS, so no poll starts on a turn that timed out).
//
// Each token's master has its own variant URL: Player's source (F-24, F-25) and its alignment cache (F-23) are per
// token. A token numbers the stream from its own base (B-054): 0 here, or the page's base when the token came.
//
// The model does what the code does: player-model.int.spec.ts replays its traces on the real Player and Stream, and
// compares each step. The invariants say what should hold; `bun run model:check` and
// `bun run model:verify` look for steps that break them.
//
// -1 stands for none (no number, no offset, no live number, no token). Source 0 is the page's playlist, t token t's.
module player {
  pure val W = 14                  // segments per playlist (B-022)
  pure val JUMPS = Set(1, 2, 4)    // how much further ahead the page numbers the stream once a break is over (B-054: 1 to 5)
  pure val MIN_BREAK = 8           // ad segments in a break, at least
  pure val LAGS = Set(0, 5)        // segments a token's playlists end behind the stream (B-048)
  pure val BASES = Set("own", "page")   // a new token numbers from base 0, or from the page's base of that time (B-054)
  pure val SEGMENT_MS = 2000
  pure val CONTAMINATED_MS = 5000  // F-10, player.ts
  pure val START_MS = 1000000
  pure val MAX_WAIT = 2            // segments a backup takes to answer, at most (B-056: 0.40 to 0.72 s)
  const MAX_TOKEN: int             // how many tokens Twitch gives in a run (modules simulation and exhaustive below)
  pure val TOKENS = 1.to(MAX_TOKEN)  // token 1 is the one the load starts with
  const MAX_LIVE: int              // the newest live segment a run reaches (modules simulation and exhaustive below)
  const POLLS: Set[int]            // the polls the player can have in flight (modules below)
  pure val KINDS = Set("clean", "adsSame", "adsEarlier")
  pure val NONE = -1
  pure val PAGE = 0

  type Snapshot = { live: int, ahead: int, adStart: int }     // the page's playlist a poll got
  type Poll = { waiting: bool, snap: Snapshot, token: int }   // waiting: for the answer of token `token`'s playlist
  type Token = { lag: int, offset: int }                      // offset: its MEDIA-SEQUENCE minus the live number
  // contents: the playlist's W segments by position, 0 for `first` (number first + i -> live segment, -1: blank). A map
  // over a fixed range, not one over first.to(newest): Apalache needs the size of every set before it runs
  // newestLive: the live number under `newest` (-1: the playlist has ad segments); held: the newest live segment it holds
  type Out = { newest: int, first: int, newestLive: int, held: int, contents: int -> int }
  type Obs = { delivered: bool, newest: int, recorded: int, restart: bool, newestLive: int }
  type Step = { name: str, poll: int, answer: str, token: int, lag: int, offset: int }
  type Delivery = {
    deliveredNewest: int, deliveredSource: int, deliveredLive: int,
    have: int, haveLive: int, repeated: bool, waiting: bool, missed: bool, misrecorded: bool, obs: Obs,
    restartedBy: str,
  }

  // Twitch
  var now: int                 // ms
  var live: int                // newest live segment of the stream
  var pageAhead: int           // the page's MEDIA-SEQUENCE minus the live number
  var adStart: int             // first live number the page's playlist gives as an ad in this break (-1: no break)
  var cleanPolls: int          // polls without ads since the last break ended (capped at 1)
  var pollsSinceTick: int
  var since: int               // segments since the player last started a poll
  var tokens: int -> Token     // every token Twitch gave, by id
  // Player's fields
  var source: int              // this.source
  var deliveredNewest: int     // this.delivered
  var deliveredSource: int
  var deliveredLive: int
  var pageSequence: int        // this.pageSequence, as its MEDIA-SEQUENCE minus live number
  var shifts: int -> int       // this.sequenceShifts: token -> shift
  var contaminatedUntil: int
  var polls: int -> Poll
  // Stream's fields
  var server: int              // the token whose master is the frontpage server (-1: none)
  var tokenPending: bool       // a token request in flight (pendingAccess)
  var nextToken: int
  // the player
  var have: int                // the last number it fetched
  var haveLive: int            // the newest live segment on its timeline
  var repeated: bool           // it fetched a live segment at or behind that one, with no restart since
  var waiting: bool            // it waits for a number past the next one
  var missed: bool             // the number it asked for was behind the playlist's first
  var misrecorded: bool        // Player recorded another source than the one of the playlist it gave
  // for the replay
  var did: Step                // what this step did
  var obs: Obs
  var gave: str                // the path of the playlist given at this step: page, skipped, noServer, backup, merged, blank
  var restartedBy: str         // and its restart: back (F-24), again (F-28), againByOne (F-28, the segment just before)

  pure def max(a: int, b: int): int = if (a > b) a else b
  pure def firstLive(l: int): int = l - W + 1
  pure def at(o: Out, n: int): int = o.contents.get(n - o.first)   // the live segment under number n of the playlist
  pure def hasAds(s: Snapshot): bool = s.adStart != NONE and s.adStart <= s.live
  pure def step0(name: str): Step = { name: name, poll: 0, answer: "", token: NONE, lag: 0, offset: 0 }

  // the page's playlist without ads
  pure def pageOut(s: Snapshot): Out = {
    newest: s.live + s.ahead, first: firstLive(s.live) + s.ahead, newestLive: s.live, held: s.live,
    contents: 0.to(W - 1).mapBy(i => firstLive(s.live) + i),
  }

  // a clean backup ending at live number `lb`, numbered `offset` past its live numbers
  pure def backupOut(lb: int, offset: int): Out = {
    newest: lb + offset, first: firstLive(lb) + offset, newestLive: lb, held: lb,
    contents: 0.to(W - 1).mapBy(i => firstLive(lb) + i),
  }

  // the backup's playlist has ad segments: "adsSame" at the page's ad positions, "adsEarlier" its oldest segment
  pure def backupHasAds(kind: str, lb: int, start: int): bool =
    kind == "adsEarlier" or (kind == "adsSame" and start != NONE and start <= lb)

  // the page's playlist with ads, merged with an unclean backup ending at `lb` (E5) and blanked (F-14): a page ad
  // segment gets the backup's live segment at its date-time, else it is blank; kind "none": no backup asked
  pure def mergedOut(s: Snapshot, kind: str, lb: int): Out = {
    val contents = 0.to(W - 1).mapBy(i => {
      val l = firstLive(s.live) + i
      if (l < s.adStart) l
      else if (kind == "adsEarlier" and l > firstLive(lb) and l <= lb) l
      else NONE
    })
    {
      newest: s.live + s.ahead, first: firstLive(s.live) + s.ahead, newestLive: NONE,
      // T-832: the page's own segments and the ones that replaced its ads, the newest one; the blank ones hold none
      held: contents.keys().fold(NONE, (acc, i) => max(acc, contents.get(i))),
      contents: contents,
    }
  }

  // followSequence (F-24, F-28), then what the player fetches from `out`
  def deliveryOf(out: Out, recorded: int, actual: int): Delivery = {
    val back = deliveredNewest != NONE and deliveredSource != recorded and out.newest < deliveredNewest
    val following = if (deliveredNewest == NONE or deliveredLive == NONE or out.newestLive == NONE or
                   deliveredNewest + 1 < out.first or deliveredNewest + 1 > out.newest) NONE
               else at(out, deliveredNewest + 1)
    val again = not(back) and following != NONE and following <= deliveredLive
    val restart = back or again
    val by = if (back) "back" else if (again and following == deliveredLive) "againByOne" else if (again) "again" else ""
    val top = at(out, out.newest)
    // T-832: the newest live segment the player has, kept across playlists until a restart
    val carried = if (deliveredNewest == NONE or restart or deliveredLive == NONE) out.held
                  else if (out.held == NONE) deliveredLive else max(deliveredLive, out.held)
    val fetched = 0.to(W - 1).filter(i => have + 1 + i <= out.newest).map(i => have + 1 + i)
    val base = {
      deliveredNewest: out.newest, deliveredSource: recorded, deliveredLive: carried,
      have: out.newest, haveLive: haveLive, repeated: repeated, waiting: false, missed: missed,
      misrecorded: misrecorded or recorded != actual,
      obs: { delivered: true, newest: out.newest, recorded: recorded, restart: restart, newestLive: out.newestLive },
      restartedBy: by,
    }
    if (have == NONE or restart)
      // a restart starts the player's timeline over at the end of `out` (it holds nothing from before, T-829)
      { ...base, haveLive: top }
    else if (have + 1 < out.first)
      // not measured what the player does then; taken as going to the end of `out`
      { ...base, haveLive: max(haveLive, top), missed: true }
    else if (have + 1 > out.newest)
      { ...base, have: have, waiting: have > out.newest }
    else {
      ...base,
      haveLive: fetched.fold(haveLive, (acc, n) => max(acc, at(out, n))),
      repeated: repeated or fetched.exists(n => at(out, n) != NONE and at(out, n) <= haveLive),
    }
  }

  action applyDelivery(d: Delivery): bool = all {
    deliveredNewest' = d.deliveredNewest, deliveredSource' = d.deliveredSource, deliveredLive' = d.deliveredLive,
    have' = d.have, haveLive' = d.haveLive, repeated' = d.repeated, waiting' = d.waiting, missed' = d.missed,
    misrecorded' = d.misrecorded, obs' = d.obs, restartedBy' = d.restartedBy,
  }

  action noDelivery: bool = all {
    deliveredNewest' = deliveredNewest, deliveredSource' = deliveredSource, deliveredLive' = deliveredLive,
    have' = have, haveLive' = haveLive, repeated' = repeated, waiting' = waiting, missed' = missed,
    misrecorded' = misrecorded, obs' = { ...obs, delivered: false }, restartedBy' = "",
  }

  action keepStream: bool = all { server' = server, tokenPending' = tokenPending, nextToken' = nextToken, tokens' = tokens }

  val noneWaiting = POLLS.forall(p => not(polls.get(p).waiting))

  action init = {
    nondet l = LAGS.oneOf()
    all {
      now' = START_MS, live' = 20, pageAhead' = 0, adStart' = NONE,
      cleanPolls' = 0, pollsSinceTick' = 0, since' = 0,
      tokens' = TOKENS.mapBy(t => if (t == 1) { lag: l, offset: 0 } else { lag: 0, offset: 0 }),
      source' = PAGE, deliveredNewest' = NONE, deliveredSource' = PAGE, deliveredLive' = NONE,
      pageSequence' = NONE, shifts' = TOKENS.mapBy(_ => NONE), contaminatedUntil' = 0,
      polls' = POLLS.mapBy(_ => { waiting: false, snap: { live: 0, ahead: 0, adStart: NONE }, token: NONE }),
      server' = 1, tokenPending' = false, nextToken' = 2,
      have' = NONE, haveLive' = NONE, repeated' = false, waiting' = false, missed' = false, misrecorded' = false,
      did' = { ...step0("init"), token: 1, lag: l }, gave' = "", restartedBy' = "",
      obs' = { delivered: false, newest: NONE, recorded: PAGE, restart: false, newestLive: NONE },
    }
  }

  // the stream moves one segment; the player starts a poll at least every 2 segments, and a backup answers within
  // MAX_WAIT segments
  action tick = all {
    live < MAX_LIVE, since < 2,
    POLLS.forall(p => not(polls.get(p).waiting) or live - polls.get(p).snap.live < MAX_WAIT),
    now' = now + SEGMENT_MS, live' = live + 1, pageAhead' = pageAhead, adStart' = adStart,
    cleanPolls' = cleanPolls, pollsSinceTick' = 0, since' = since + 1,
    source' = source, pageSequence' = pageSequence, shifts' = shifts, contaminatedUntil' = contaminatedUntil,
    polls' = polls, noDelivery, keepStream,
    did' = step0("tick"), gave' = "",
  }

  // a stitched break: the page's playlist gives the segments after the newest as ads (breaks are minutes apart)
  action breakStart = all {
    adStart == NONE, cleanPolls >= 1, noneWaiting,
    now' = now, live' = live, pageAhead' = pageAhead, adStart' = live + 1,
    cleanPolls' = cleanPolls, pollsSinceTick' = pollsSinceTick, since' = since,
    source' = source, pageSequence' = pageSequence, shifts' = shifts, contaminatedUntil' = contaminatedUntil,
    polls' = polls, noDelivery, keepStream,
    did' = step0("breakStart"), gave' = "",
  }

  // B-034, B-054: the break is over; the page's playlist is live again, numbering the stream `jump` further ahead
  action breakEnd(jump: int): bool = all {
    adStart != NONE, live - adStart + 1 >= MIN_BREAK, noneWaiting,
    now' = now, live' = live, pageAhead' = pageAhead + jump, adStart' = NONE,
    cleanPolls' = 0, pollsSinceTick' = pollsSinceTick, since' = since,
    source' = source, pageSequence' = pageSequence, shifts' = shifts, contaminatedUntil' = contaminatedUntil,
    polls' = polls, noDelivery, keepStream,
    did' = step0("breakEnd"), gave' = "",
  }

  // onFetch, once the poll before it has given its playlist: the source is the page's; without ads its playlist as it is (F-23's reference, shifts cleared); with
  // ads and the frontpage type left out (F-10) the page's playlist blanked; with no frontpage server, the page's
  // playlist blanked and a token asked (noteBackup); else the server's playlist asked, and the poll waits
  action start(p: int): bool = {
    val s = { live: live, ahead: pageAhead, adStart: adStart }
    all {
      noneWaiting, pollsSinceTick < 2,
      now' = now, live' = live, pageAhead' = pageAhead, adStart' = adStart,
      pollsSinceTick' = pollsSinceTick + 1, since' = 0,
      source' = PAGE, contaminatedUntil' = contaminatedUntil, tokens' = tokens, nextToken' = nextToken, server' = server,
      did' = { ...step0("start"), poll: p },
      if (not(hasAds(s))) all {
        cleanPolls' = 1, pageSequence' = s.ahead, shifts' = TOKENS.mapBy(_ => NONE), polls' = polls, gave' = "page",
        tokenPending' = tokenPending,
        applyDelivery(deliveryOf(pageOut(s), PAGE, PAGE)),
      } else if (contaminatedUntil > now) all {
        cleanPolls' = cleanPolls, pageSequence' = pageSequence, shifts' = shifts, polls' = polls, gave' = "skipped",
        tokenPending' = tokenPending,
        applyDelivery(deliveryOf(mergedOut(s, "none", 0), PAGE, PAGE)),
      } else if (server == NONE) all {
        cleanPolls' = cleanPolls, pageSequence' = pageSequence, shifts' = shifts, polls' = polls, gave' = "noServer",
        tokenPending' = true,
        applyDelivery(deliveryOf(mergedOut(s, "none", 0), PAGE, PAGE)),
      } else all {
        cleanPolls' = cleanPolls, pageSequence' = pageSequence, shifts' = shifts,
        polls' = polls.set(p, { waiting: true, snap: s, token: server }), gave' = "",
        tokenPending' = tokenPending,
        noDelivery,
      },
    }
  }

  // token t's playlist answers poll p: clean, it is given numbered as the page numbers the same live segment (F-23,
  // F-27), and this.source becomes token t's; unclean, its server is dropped and a token asked, the type is left out
  // for CONTAMINATED_MS, and the page's playlist is given merged and blanked. followSequence then records the source of the
  // playlist this poll gave.
  action answer(p: int, kind: str): bool = {
    val poll = polls.get(p)
    val s = poll.snap
    val t = poll.token
    val lb = live - tokens.get(t).lag
    val own = tokens.get(t).offset
    val unclean = backupHasAds(kind, lb, adStart)
    val reference = if (pageSequence != NONE) pageSequence else if (s.adStart > firstLive(s.live)) s.ahead else NONE
    val shift = if (shifts.get(t) != NONE) shifts.get(t) else if (reference != NONE) reference - own else 0
    val merged = mergedOut(s, kind, lb)
    all {
      poll.waiting,
      now' = now, live' = live, pageAhead' = pageAhead, adStart' = adStart,
      cleanPolls' = cleanPolls, pollsSinceTick' = pollsSinceTick, since' = since,
      pageSequence' = pageSequence, polls' = polls.set(p, { ...poll, waiting: false }),
      tokens' = tokens, nextToken' = nextToken,
      did' = { ...step0("answer"), poll: p, answer: kind, token: t },
      if (unclean) all {
        source' = source, shifts' = shifts, contaminatedUntil' = now + CONTAMINATED_MS,
        server' = if (server == t) NONE else server, tokenPending' = true,
        gave' = if (merged.contents.keys().exists(i => merged.first + i - s.ahead >= s.adStart and merged.contents.get(i) != NONE)) "merged" else "blank",
        applyDelivery(deliveryOf(merged, source, PAGE)),
      } else all {
        source' = t, shifts' = if (shifts.get(t) != NONE or reference == NONE) shifts else shifts.set(t, reference - own),
        contaminatedUntil' = contaminatedUntil, server' = server, tokenPending' = tokenPending, gave' = "backup",
        applyDelivery(deliveryOf(backupOut(lb, own + shift), t, t)),
      },
    }
  }

  // the token request ends: a new master, whose variant replaces the frontpage server
  action token(lag: int, base: str): bool = all {
    tokenPending, nextToken <= MAX_TOKEN,
    now' = now, live' = live, pageAhead' = pageAhead, adStart' = adStart,
    cleanPolls' = cleanPolls, pollsSinceTick' = pollsSinceTick, since' = since,
    source' = source, pageSequence' = pageSequence, shifts' = shifts, contaminatedUntil' = contaminatedUntil,
    polls' = polls, noDelivery,
    tokens' = tokens.set(nextToken, { lag: lag, offset: if (base == "page") pageAhead else 0 }),
    server' = nextToken, tokenPending' = false, nextToken' = nextToken + 1,
    did' = { ...step0("token"), answer: if (server != NONE) "replaces" else "fills", token: nextToken, lag: lag, offset: if (base == "page") pageAhead else 0 }, gave' = "",
  }

  action step = {
    nondet p = POLLS.oneOf()
    nondet kind = KINDS.oneOf()
    nondet jump = JUMPS.oneOf()
    nondet lag = LAGS.oneOf()
    nondet base = BASES.oneOf()
    any { tick, breakStart, breakEnd(jump), start(p), answer(p, kind), token(lag, base) }
  }

  // what should hold
  val noRepeat = not(repeated)                       // F-28 (T-832 breaks it)
  val noWait = not(waiting)                          // F-24, F-25
  val recordedIsDelivered = not(misrecorded)         // T-831 breaks it
  val noMiss = not(missed)
  val serverOrToken = server != NONE or tokenPending or nextToken > MAX_TOKEN   // never without a server and no token asked

  // paths the replay must go through: each holds until a step takes that path, and model:traces keeps a trace that
  // breaks it
  val neverSequenceBack = restartedBy != "back"
  val neverRepeatRestart = restartedBy != "again"
  val neverRepeatByOne = restartedBy != "againByOne"
  val neverSkipped = gave != "skipped"
  val neverNoServer = gave != "noServer"
  val neverMerged = gave != "merged"
  val neverBlank = gave != "blank"
  val neverTokenOnPageBase = not(did.name == "token" and did.offset > 0)
  val neverSwitchBetweenTokens = not(gave == "backup" and obs.restart and deliveredSource > 1)
}

// random runs (bun run model:check, model:traces)
module simulation {
  import player(MAX_LIVE = 60, MAX_TOKEN = 4, POLLS = Set(1, 2)).*
}

// serverOrToken depends on the tokens only: one poll at a time
module exhaustiveTokens {
  import player(MAX_LIVE = 32, MAX_TOKEN = 2, POLLS = Set(1)).*
}

// every state up to a break and the polls after it, with the one token the load starts with (bun run model:verify, TLC)
module exhaustivePolls {
  import player(MAX_LIVE = 32, MAX_TOKEN = 1, POLLS = Set(1, 2)).*
}
