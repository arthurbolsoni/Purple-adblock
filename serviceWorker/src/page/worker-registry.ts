export type WorkerMessage = { funcName: string; value?: any };
type MessageTarget = { postMessage: (message: any) => void };

// Every worker running Purple's code in this page. Page-wide state (settings, integrity, quality) is sent to every
// live worker, and the last message of each funcName is replayed to workers created later.
export class WorkerRegistry {
  private workers = new Set<MessageTarget>();
  private last = new Map<string, WorkerMessage>();

  get size() {
    return this.workers.size;
  }

  add(worker: MessageTarget) {
    this.workers.add(worker);
    for (const message of this.last.values()) worker.postMessage(message);
  }

  remove(worker: MessageTarget) {
    this.workers.delete(worker);
  }

  broadcast(message: WorkerMessage) {
    this.last.set(message.funcName, message);
    for (const worker of this.workers) {
      try {
        worker.postMessage(message);
      } catch {
        // a worker that cannot receive messages any more must not keep the others from getting them
      }
    }
  }
}
