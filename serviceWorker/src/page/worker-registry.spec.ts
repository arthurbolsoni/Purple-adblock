import { describe, expect, test } from "bun:test";
import { WorkerRegistry } from "./worker-registry";

const fakeWorker = () => {
  const posted: any[] = [];
  return { posted, postMessage: (message: any) => posted.push(message) };
};

describe("WorkerRegistry", () => {
  test("broadcast reaches every registered worker", () => {
    const registry = new WorkerRegistry();
    const a = fakeWorker();
    const b = fakeWorker();
    registry.add(a);
    registry.add(b);

    registry.broadcast({ funcName: "setSettings", value: 1 });

    expect(a.posted).toEqual([{ funcName: "setSettings", value: 1 }]);
    expect(b.posted).toEqual([{ funcName: "setSettings", value: 1 }]);
  });

  test("a worker added later gets the last message of each funcName, in first-broadcast order", () => {
    const registry = new WorkerRegistry();
    registry.broadcast({ funcName: "setSettings", value: 1 });
    registry.broadcast({ funcName: "setQuality", value: "720p60" });
    registry.broadcast({ funcName: "setSettings", value: 2 });

    const later = fakeWorker();
    registry.add(later);

    expect(later.posted).toEqual([
      { funcName: "setSettings", value: 2 },
      { funcName: "setQuality", value: "720p60" },
    ]);
  });

  test("a removed worker gets nothing more", () => {
    const registry = new WorkerRegistry();
    const a = fakeWorker();
    registry.add(a);
    registry.remove(a);

    registry.broadcast({ funcName: "setSettings", value: 1 });

    expect(a.posted).toEqual([]);
    expect(registry.size).toBe(0);
  });

  test("a worker that throws on postMessage does not stop the others", () => {
    const registry = new WorkerRegistry();
    registry.add({
      postMessage: () => {
        throw new Error("terminated");
      },
    });
    const b = fakeWorker();
    registry.add(b);

    registry.broadcast({ funcName: "setIntegrity", value: "x" });

    expect(b.posted).toEqual([{ funcName: "setIntegrity", value: "x" }]);
  });
});
