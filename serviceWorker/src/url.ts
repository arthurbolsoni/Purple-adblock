// URL of a fetch input: a string, a URL or a Request.
export const urlOf = (input: RequestInfo | URL): string => (typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
