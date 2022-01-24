import fetch from "cross-fetch";
import type {} from "cross-fetch";
// import type { RequestInfo, RequestInit, Response } from "cross-fetch";

export default function (url: RequestInfo, options: RequestInit, timeout = 7000): Promise<Response> {
  return Promise.race<Response>([fetch(url, options), new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeout))]);
}
