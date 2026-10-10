// Entry of the worker bundle: prepended to Twitch's worker script by index.ts.
import { bootstrapWorker } from "./bootstrap";

bootstrapWorker(self as any);
