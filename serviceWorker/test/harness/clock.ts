// A clock with timers for page modules that take their timers as a dependency (page/diagnostics.ts): nothing runs until
// `advance`, which runs every timer due on the way, in time order, with `now()` at the timer's time.
type Timer = { id: number; at: number; run: () => void; every?: number };

export class FakeClock {
  private timers: Timer[] = [];
  private next = 1;

  constructor(public time = Date.parse("2026-11-21T12:00:00.000Z")) {}

  now = () => this.time;
  setTimeout = (run: () => void, ms: number) => this.add(run, ms);
  setInterval = (run: () => void, ms: number) => this.add(run, ms, Math.max(1, ms));
  clearTimeout = (id: unknown) => {
    this.timers = this.timers.filter((timer) => timer.id !== id);
  };
  clearInterval = (id: unknown) => this.clearTimeout(id);

  // intervals running now
  get intervals() {
    return this.timers.filter((timer) => timer.every != null).length;
  }

  advance(ms: number) {
    const end = this.time + ms;
    for (;;) {
      const due = this.timers.filter((timer) => timer.at <= end).sort((a, b) => a.at - b.at || a.id - b.id)[0];
      if (!due) break;
      this.time = due.at;
      if (due.every != null) due.at += due.every;
      else this.timers = this.timers.filter((timer) => timer !== due);
      due.run();
    }
    this.time = end;
  }

  private add(run: () => void, ms: number, every?: number) {
    const id = this.next++;
    this.timers.push({ id, at: this.time + Math.max(0, ms), run, every });
    return id;
  }
}
