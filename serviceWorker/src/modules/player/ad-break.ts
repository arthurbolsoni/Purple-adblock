// F-15 (T-601): state of the main media playlist across polls, and what the player gets when it changes.
// E6 as before: pause/play when a break starts and when it ends, and again if ads come back while recovering.
// With reloadAfterAd (default off), the end of a break asks the page to reload the player instead, once per break and
// at most once every RELOAD_COOLDOWN_MS (Brave's script: ReloadPlayerAfterAd, ReloadCooldownSeconds).

export enum AdBreakState {
  IDLE = "idle",
  AD = "ad",
  RECOVERING = "recovering",
}

// as Brave's ReloadCooldownSeconds
export const RELOAD_COOLDOWN_MS = 30_000;
// clean polls for this long after the end of a break bring the state back to idle; ads before that are the same break
export const RECOVERING_MS = 10_000;

export type AdBreakActions = {
  pauseAndPlay: () => void;
  reload: () => void;
  reloadAfterAd: () => boolean;
  now?: () => number;
};

export class AdBreak {
  state = AdBreakState.IDLE;
  private endedAt = 0;
  private lastReload = -Infinity;
  private reloadedThisBreak = false;

  constructor(private readonly actions: AdBreakActions) {}

  private now = () => (this.actions.now ?? Date.now)();

  // one poll of the main playlist; `ads`: it has ad segments (SSAI)
  poll(ads: boolean): AdBreakState {
    const now = this.now();
    switch (this.state) {
      case AdBreakState.IDLE:
        if (ads) {
          this.state = AdBreakState.AD;
          this.reloadedThisBreak = false;
          this.actions.pauseAndPlay();
        }
        break;
      case AdBreakState.AD:
        if (!ads) {
          this.state = AdBreakState.RECOVERING;
          this.endedAt = now;
          this.end(now);
        }
        break;
      case AdBreakState.RECOVERING:
        if (ads) {
          this.state = AdBreakState.AD;
          this.actions.pauseAndPlay();
        } else if (now - this.endedAt >= RECOVERING_MS) {
          this.state = AdBreakState.IDLE;
        }
        break;
    }
    return this.state;
  }

  private end(now: number) {
    if (this.actions.reloadAfterAd() && !this.reloadedThisBreak && now - this.lastReload >= RELOAD_COOLDOWN_MS) {
      this.reloadedThisBreak = true;
      this.lastReload = now;
      this.actions.reload();
      return;
    }
    this.actions.pauseAndPlay();
  }
}
