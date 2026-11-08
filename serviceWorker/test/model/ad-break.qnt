// T-010: AdBreak (modules/player/ad-break.ts, F-15, T-601): the state of the main media playlist across polls and what
// the player gets at the edges of a break: pause and play (E6), or with reloadAfterAd a reload, once per break and at
// most once every RELOAD_COOLDOWN_MS (Brave's ReloadPlayerAfterAd and ReloadCooldownSeconds).
//
// The model does what the code does; ad-break-model.int.spec.ts replays its traces on the real AdBreak. -1: none.
module adBreak {
  pure val RECOVERING_MS = 10000       // ad-break.ts
  pure val RELOAD_COOLDOWN_MS = 30000  // ad-break.ts
  pure val GAPS = Set(2000, 6000, 12000, 31000)   // ms between two polls
  pure val NONE = -1
  const MAX_POLLS: int

  type Did = { name: str, from: str, ads: bool, gap: int, setting: bool, sinceReload: int, sinceEnd: int }

  var now: int
  var polls: int
  var reloadAfterAd: bool       // the setting, read at each break's end
  // AdBreak's fields
  var state: str                // "idle" | "ad" | "recovering"
  var endedAt: int
  var lastReload: int           // -1: never (the code starts it at -Infinity)
  var reloadedThisBreak: bool
  // what the last step did and called: "" | "pauseAndPlay" | "reload"
  var did: Did
  var called: str
  // for the invariants
  var reloadsInBreak: int       // reloads since the break began (idle -> ad)
  var tooSoon: bool             // a reload came less than RELOAD_COOLDOWN_MS after the one before
  var wrongEdge: bool           // an edge with no action, or an action with no edge

  action init = all {
    now' = 1000000, polls' = 0, reloadAfterAd' = false,
    state' = "idle", endedAt' = 0, lastReload' = NONE, reloadedThisBreak' = false,
    did' = { name: "init", from: "", ads: false, gap: 0, setting: false, sinceReload: NONE, sinceEnd: NONE }, called' = "",
    reloadsInBreak' = 0, tooSoon' = false, wrongEdge' = false,
  }

  pure def withAds(content: str): bool = content == "ads"

  // one poll of the main playlist, `gap` ms after the one before; `content`: "ads" when it has ad segments (SSAI).
  action poll(content: str, gap: int): bool = {
    val t = now + gap
    val cooled = lastReload == NONE or t - lastReload >= RELOAD_COOLDOWN_MS
    // end(): a reload when the setting is on, not done in this break and cooled down; else pause and play
    val reloads = reloadAfterAd and not(reloadedThisBreak) and cooled
    val after =
      if (state == "idle") (if (withAds(content)) "ad" else "idle")
      else if (state == "ad") (if (withAds(content)) "ad" else "recovering")
      else if (withAds(content)) "ad" else if (t - endedAt >= RECOVERING_MS) "idle" else "recovering"
    val act =
      if (state == "idle" and withAds(content)) "pauseAndPlay"
      else if (state == "ad" and not(withAds(content))) (if (reloads) "reload" else "pauseAndPlay")
      else if (state == "recovering" and withAds(content)) "pauseAndPlay"
      else ""
    val edge = (state == "idle" and after == "ad") or (state == "ad" and after == "recovering") or (state == "recovering" and after == "ad")
    all {
      polls < MAX_POLLS,
      now' = t, polls' = polls + 1, reloadAfterAd' = reloadAfterAd,
      state' = after,
      endedAt' = if (state == "ad" and not(withAds(content))) t else endedAt,
      lastReload' = if (act == "reload") t else lastReload,
      reloadedThisBreak' = if (state == "idle" and withAds(content)) false else if (act == "reload") true else reloadedThisBreak,
      did' = {
        name: "poll", from: state, ads: withAds(content), gap: gap, setting: reloadAfterAd,
        sinceReload: if (lastReload == NONE) NONE else t - lastReload, sinceEnd: t - endedAt,
      }, called' = act,
      reloadsInBreak' = (if (state == "idle" and withAds(content)) 0 else reloadsInBreak) + (if (act == "reload") 1 else 0),
      tooSoon' = (tooSoon or (act == "reload" and lastReload != NONE and t - lastReload < RELOAD_COOLDOWN_MS)),
      wrongEdge' = (wrongEdge or (edge != (act != ""))),
    }
  }

  // the viewer turns reloadAfterAd on or off (C-10: the stored settings reach the worker whole)
  action setting(value: str): bool = all {
    polls < MAX_POLLS,
    now' = now, polls' = polls, reloadAfterAd' = value == "on",
    state' = state, endedAt' = endedAt, lastReload' = lastReload, reloadedThisBreak' = reloadedThisBreak,
    did' = { name: "setting", from: state, ads: false, gap: 0, setting: value == "on", sinceReload: NONE, sinceEnd: NONE }, called' = "",
    reloadsInBreak' = reloadsInBreak, tooSoon' = tooSoon, wrongEdge' = wrongEdge,
  }

  action step = {
    nondet content = Set("ads", "live").oneOf()
    nondet gap = GAPS.oneOf()
    nondet value = Set("on", "off").oneOf()
    any { poll(content, gap), setting(value) }
  }

  // what should hold
  val oneReloadPerBreak = reloadsInBreak <= 1
  val reloadsCooledDown = not(tooSoon)
  val oneActionPerEdge = not(wrongEdge)

  // paths the replay must go through
  val neverReload = called != "reload"
  val neverPauseAtEnd = not(did.from == "ad" and state == "recovering" and called == "pauseAndPlay")
  val neverBackToIdle = not(did.from == "recovering" and state == "idle")
  val neverAdsAgainWhileRecovering = not(did.from == "recovering" and state == "ad")
  // a break's end with the setting on and no reload yet in this break, less than RELOAD_COOLDOWN_MS after the last one
  val neverReloadTurnedDownByCooldown = not(
    did.from == "ad" and state == "recovering" and did.setting and called == "pauseAndPlay" and reloadsInBreak == 0 and
    did.sinceReload != NONE and did.sinceReload < RELOAD_COOLDOWN_MS
  )
  // the limits themselves: a reload exactly RELOAD_COOLDOWN_MS after the one before, idle exactly RECOVERING_MS after
  // the break's end
  val neverReloadAtCooldown = not(called == "reload" and did.sinceReload == RELOAD_COOLDOWN_MS)
  val neverIdleAtRecovering = not(did.from == "recovering" and state == "idle" and did.sinceEnd == RECOVERING_MS)
}

module simulation {
  import adBreak(MAX_POLLS = 40).*
}

module exhaustive {
  import adBreak(MAX_POLLS = 9).*
}
