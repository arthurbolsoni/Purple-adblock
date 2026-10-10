// F-06 (T-402): GQL requests the page executes for the worker, as Brave's scriptlet does (behavior reimplemented,
// docs/research.md). The worker posts { type: "gqlRequest", id, body, headers }; the page answers
// { funcName: "gqlResponse", value: { id, status, body } }. Answers are matched by id. Without the page's bridge
// (setGqlBridge), with no answer within 5 s, or with a failed answer, the worker sends the request itself.
import type { WorkerContext } from "../../scope";

export const GQL_URL = "https://gql.twitch.tv/gql#origin=twilight";
export const PAGE_GQL_TIMEOUT_MS = 5000;

export type GqlAnswer = { id: number; status: number; body?: string; error?: string };

export class PageGql {
  private enabled = false;
  private next = 1;
  private pending = new Map<number, (answer: GqlAnswer) => void>();

  constructor(private readonly scope: Pick<WorkerContext, "postMessage" | "request" | "logger">) {}

  // the page's setGqlBridge
  enable() {
    this.enabled = true;
  }

  request(body: string, headers: Record<string, string>): Promise<Response> {
    if (!this.enabled) return this.direct(body, headers);
    const id = this.next++;
    return new Promise<Response>((resolve) => {
      const timer = setTimeout(() => {
        if (!this.pending.delete(id)) return;
        this.scope.logger("GQL request", id, "not answered by the page; sent from the worker");
        resolve(this.direct(body, headers));
      }, PAGE_GQL_TIMEOUT_MS);
      this.pending.set(id, (answer) => {
        clearTimeout(timer);
        resolve(answer.status ? new Response(answer.body ?? "", { status: answer.status }) : this.direct(body, headers));
      });
      this.scope.postMessage({ type: "gqlRequest", id, body, headers });
    });
  }

  // the page's gqlResponse
  answer(value: GqlAnswer) {
    const done = value && this.pending.get(value.id);
    if (!done) return;
    this.pending.delete(value.id);
    done(value);
  }

  private direct(body: string, headers: Record<string, string>) {
    return this.scope.request(GQL_URL, { method: "POST", headers, body });
  }
}
