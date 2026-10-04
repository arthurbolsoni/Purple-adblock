import { afterAll, beforeAll, spyOn } from "bun:test";

type Method = "log" | "error" | "warn";

// Silences console methods for the whole file (beforeAll hooks included) and restores them afterwards.
// The worker code still logs with console.log until T-109 puts logs behind the debug flag.
// Call it before any beforeAll that logs.
export function silenceConsole(methods: Method[] = ["log"]) {
  let spies: ReturnType<typeof spyOn>[] = [];
  beforeAll(() => {
    spies = methods.map((method) => spyOn(console, method).mockImplementation(() => {}));
  });
  afterAll(() => {
    for (const spy of spies) spy.mockRestore();
  });
}
