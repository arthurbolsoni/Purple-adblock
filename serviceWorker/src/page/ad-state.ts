// F-30 (T-605): whether Purple is blocking an ad in this page right now. Each worker says when its main playlist enters
// and leaves a break ("adState"); the page is blocking while any live worker is, and `onChange` runs when that changes
// (index.ts tells the content script, which tells the background script that draws the icon's badge).
export class AdState<W extends object> {
  private blocking = new Set<W>();
  private last = false;

  constructor(private readonly onChange: (blocking: boolean) => void) {}

  set(worker: W, blocking: boolean) {
    if (blocking) this.blocking.add(worker);
    else this.blocking.delete(worker);
    const now = this.blocking.size > 0;
    if (now === this.last) return;
    this.last = now;
    try {
      this.onChange(now);
    } catch {
      // the badge is not worth an error in the page (rule 5)
    }
  }

  // a worker that ends takes its break with it
  remove(worker: W) {
    this.set(worker, false);
  }
}
