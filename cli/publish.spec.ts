// TS-703: the signed release steps (cli/publish.ts), with web-ext, git and the stores replaced by fakes.
import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import {
  AMO_ADDON_ID,
  CWS_API,
  CWS_SCOPE,
  GOOGLE_TOKEN_URL,
  APPROVAL_MS,
  chromeToken,
  firefoxVersion,
  publishChrome,
  serviceAccountAssertion,
  signFirefox,
  amoMetadata,
  webExtSign,
} from "./publish";

describe("Firefox version", () => {
  test("a release keeps the package version", () => {
    expect(firefoxVersion("2.7.0")).toBe("2.7.0");
  });

  test("a pre-release tag <version>-<label>.<n> gets <version>.<n>", () => {
    expect(firefoxVersion("2.7.0", "2.7.0-beta.1")).toBe("2.7.0.1");
    expect(firefoxVersion("2.7.0", "2.7.0-rc.12")).toBe("2.7.0.12");
  });

  test.each(["2.7.1-beta.1", "2.7.0-beta", "2.7.0-beta.01", "2.7.0-beta.0", "v2.7.0-beta.1"])("tag %s is refused", (tag) => {
    expect(() => firefoxVersion("2.7.0", tag)).toThrow("expected 2.7.0-<label>.<number>");
  });

  test("a version Firefox does not accept is refused", () => {
    expect(() => firefoxVersion("2.7.0-beta.1")).toThrow("not a Firefox version");
    expect(() => firefoxVersion("02.7.0")).toThrow("not a Firefox version");
  });
});

describe("web-ext sign", () => {
  const paths = { sourceDir: "dist/sign/purple-adblock-firefox", artifactsDir: "dist/sign/artifacts", sourceArchive: "dist/src.zip", metadata: "dist/sign/amo-metadata.json" };
  const env = { AMO_JWT_ISSUER: "user:1:2", AMO_JWT_SECRET: "s3cret" };

  test("listed: submitted with the source, no wait for the review", () => {
    const { args } = webExtSign({ channel: "listed", ...paths, env });
    expect(args).toEqual([
      "sign", "--channel", "listed", "--source-dir", paths.sourceDir, "--artifacts-dir", paths.artifactsDir,
      "--upload-source-code", paths.sourceArchive, "--amo-metadata", paths.metadata, "--approval-timeout", "0", "--no-input",
    ]);
  });

  test("unlisted: waits for the signed file", () => {
    const { args } = webExtSign({ channel: "unlisted", ...paths, env });
    expect(args[args.indexOf("--approval-timeout") + 1]).toBe(String(APPROVAL_MS));
  });

  test("listed with wait: waits for the approval and the signed file", () => {
    const { args } = webExtSign({ channel: "listed", wait: true, ...paths, env });
    expect(args[args.indexOf("--approval-timeout") + 1]).toBe(String(APPROVAL_MS));
  });

  test("the key and secret go in web-ext's environment, never in its arguments", () => {
    const sign = webExtSign({ channel: "listed", ...paths, env });
    expect(sign.env).toEqual({ WEB_EXT_API_KEY: "user:1:2", WEB_EXT_API_SECRET: "s3cret" });
    expect(sign.args.join(" ")).not.toContain("s3cret");
    expect(sign.args.join(" ")).not.toContain("user:1:2");
  });

  test("missing credentials are named", () => {
    expect(() => webExtSign({ channel: "listed", ...paths, env: { AMO_JWT_ISSUER: "x" } })).toThrow("missing in the environment: AMO_JWT_SECRET");
  });
});

describe("signFirefox", () => {
  let root = "";
  afterEach(() => root && rmSync(root, { recursive: true, force: true }));

  // a repository root with package.json; build() writes the unpacked extension as buildFirefox(true) does
  const setup = (id = AMO_ADDON_ID) => {
    root = mkdtempSync(join(tmpdir(), "purple-publish-"));
    writeFileSync(join(root, "package.json"), JSON.stringify({ version: "2.7.0", license: "Apache-2.0" }));
    const calls: { cmd: string[]; env?: Record<string, string | undefined> }[] = [];
    const deps = {
      build: async (out: string) => {
        mkdirSync(join(out, "purple-adblock-firefox"), { recursive: true });
        writeFileSync(join(out, "purple-adblock-firefox", "manifest.json"), JSON.stringify({ version: "2.7.0", browser_specific_settings: { gecko: { id } } }));
      },
      run: async (cmd: string[], env?: Record<string, string | undefined>) => {
        calls.push({ cmd, env });
        if (cmd.includes("web-ext")) {
          const artifacts = cmd[cmd.indexOf("--artifacts-dir") + 1];
          mkdirSync(artifacts, { recursive: true });
          writeFileSync(join(artifacts, "purple_ads_blocker-2.7.0.3.xpi"), "signed");
        }
      },
      log: () => {},
    };
    return { calls, deps };
  };
  const env = { AMO_JWT_ISSUER: "user:1:2", AMO_JWT_SECRET: "s3cret" };

  test("pre-release: the manifest gets the Firefox version, the source archive goes with it, the signed .xpi lands in dist", async () => {
    const { calls, deps } = setup();
    const signed = await signFirefox({ channel: "unlisted", tag: "2.7.0-beta.3", env, root }, deps);

    expect(JSON.parse(readFileSync(join(root, "dist", "sign", "purple-adblock-firefox", "manifest.json"), "utf8")).version).toBe("2.7.0.3");
    expect(calls[0].cmd).toEqual(["git", "archive", "--format=zip", `--output=${join(root, "dist", "sign", "purple-adblock-2.7.0.3-source.zip")}`, "HEAD"]);
    expect(calls[1].cmd.slice(0, 6)).toEqual(["bun", "--bun", "x", "web-ext", "sign", "--channel"]);
    expect(calls[1].env).toEqual({ WEB_EXT_API_KEY: "user:1:2", WEB_EXT_API_SECRET: "s3cret" });
    expect(signed).toBe(join(root, "dist", "purple-adblock-2.7.0.3-firefox.xpi"));
    expect(readFileSync(signed!, "utf8")).toBe("signed");
  });

  test("AMO gets the license from package.json and the build steps for its reviewers (T-706)", async () => {
    const { calls, deps } = setup();
    await signFirefox({ channel: "listed", env, root }, deps);

    const path = calls[1].cmd[calls[1].cmd.indexOf("--amo-metadata") + 1];
    const metadata = JSON.parse(readFileSync(path, "utf8"));
    expect(metadata).toEqual(amoMetadata({ version: "2.7.0", license: "Apache-2.0" }));
    expect(metadata.version.license).toBe("Apache-2.0");
    expect(metadata.version.approval_notes).toContain("bun install --frozen-lockfile");
    expect(metadata.version.approval_notes).toContain("bun run build");
  });

  test("release: listed, the package version, no file to collect", async () => {
    const { calls, deps } = setup();
    expect(await signFirefox({ channel: "listed", env, root }, deps)).toBeNull();
    expect(calls[1].cmd).toContain("listed");
    expect(JSON.parse(readFileSync(join(root, "dist", "sign", "purple-adblock-firefox", "manifest.json"), "utf8")).version).toBe("2.7.0");
  });

  test("release with wait: listed, the signed .xpi lands in dist with the package version", async () => {
    const { calls, deps } = setup();
    const signed = await signFirefox({ channel: "listed", wait: true, env, root }, deps);
    expect(calls[1].cmd).toContain("listed");
    expect(signed).toBe(join(root, "dist", "purple-adblock-2.7.0-firefox.xpi"));
    expect(readFileSync(signed!, "utf8")).toBe("signed");
  });

  test("dry run: no web-ext, no credentials needed", async () => {
    const { calls, deps } = setup();
    expect(await signFirefox({ channel: "listed", dryRun: true, env: {}, root }, deps)).toBeNull();
    expect(calls.map((c) => c.cmd[0])).toEqual(["git"]);
  });

  test("a manifest without the AMO add-on ID is not sent", async () => {
    const { calls, deps } = setup("other@example.com");
    await expect(signFirefox({ channel: "listed", env, root }, deps)).rejects.toThrow(`manifest add-on ID is not ${AMO_ADDON_ID}`);
    expect(calls).toEqual([]);
  });

  test("missing credentials stop it before the build", async () => {
    const { calls, deps } = setup();
    await expect(signFirefox({ channel: "listed", env: {}, root }, deps)).rejects.toThrow("missing in the environment: AMO_JWT_ISSUER, AMO_JWT_SECRET");
    expect(calls).toEqual([]);
  });
});

// a fetch that answers each call with the next response and records the requests
const fakeFetch = (responses: Response[]) => {
  const requests: { url: string; init: any }[] = [];
  const fetcher = (async (url: any, init?: any) => {
    requests.push({ url: String(url), init });
    return responses.shift() ?? new Response("no more responses", { status: 500 });
  }) as unknown as typeof fetch;
  return { fetcher, requests };
};

describe("Chrome Web Store token", () => {
  test("OAuth client: the refresh token is exchanged", async () => {
    const { fetcher, requests } = fakeFetch([Response.json({ access_token: "ya29.token" })]);
    const env = { CWS_CLIENT_ID: "id", CWS_CLIENT_SECRET: "secret", CWS_REFRESH_TOKEN: "refresh" };

    expect(await chromeToken(env, fetcher)).toBe("ya29.token");
    expect(requests[0].url).toBe(GOOGLE_TOKEN_URL);
    expect(Object.fromEntries(requests[0].init.body)).toEqual({ client_id: "id", client_secret: "secret", refresh_token: "refresh", grant_type: "refresh_token" });
  });

  test("service account: a JWT signed with its key, for the Chrome Web Store scope", async () => {
    const pair = (await crypto.subtle.generateKey(
      { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
      true,
      ["sign", "verify"],
    )) as CryptoKeyPair;
    const pkcs8 = Buffer.from(await crypto.subtle.exportKey("pkcs8", pair.privateKey)).toString("base64");
    const account = { client_email: "purple@project.iam.gserviceaccount.com", private_key: `-----BEGIN PRIVATE KEY-----\n${pkcs8}\n-----END PRIVATE KEY-----\n` };
    const { fetcher, requests } = fakeFetch([Response.json({ access_token: "ya29.sa" })]);

    expect(await chromeToken({ CWS_SERVICE_ACCOUNT_JSON: JSON.stringify(account) }, fetcher, 1_791_000_000_000)).toBe("ya29.sa");
    const form = Object.fromEntries(requests[0].init.body);
    expect(form.grant_type).toBe("urn:ietf:params:oauth:grant-type:jwt-bearer");
    const [header, payload, signature] = form.assertion.split(".");
    expect(JSON.parse(Buffer.from(header, "base64url").toString())).toEqual({ alg: "RS256", typ: "JWT" });
    expect(JSON.parse(Buffer.from(payload, "base64url").toString())).toEqual({
      iss: account.client_email, scope: CWS_SCOPE, aud: GOOGLE_TOKEN_URL, iat: 1_791_000_000, exp: 1_791_003_600,
    });
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", pair.publicKey, Buffer.from(signature, "base64url"), new TextEncoder().encode(`${header}.${payload}`));
    expect(valid).toBe(true);
    expect(await serviceAccountAssertion(account, 0)).toContain(".");
  });

  test("no credentials: the missing variables are named", async () => {
    await expect(chromeToken({})).rejects.toThrow("missing in the environment: CWS_CLIENT_ID, CWS_CLIENT_SECRET, CWS_REFRESH_TOKEN");
  });

  test("a refused token request does not echo the credentials", async () => {
    const { fetcher } = fakeFetch([Response.json({ error: "invalid_grant" }, { status: 400 })]);
    const error = await chromeToken({ CWS_CLIENT_ID: "id", CWS_CLIENT_SECRET: "secret", CWS_REFRESH_TOKEN: "refresh" }, fetcher).catch((e) => e);
    expect(error.message).toBe("Google token request: 400 invalid_grant");
  });
});

describe("Chrome Web Store publish", () => {
  const item = "publishers/pub-1/items/item-1";
  const options = { zip: new Uint8Array([80, 75, 3, 4]), publisherId: "pub-1", itemId: "item-1", token: "ya29.token", pollMs: 0 };
  const silent = () => {};

  test("upload, then submit for review", async () => {
    const { fetcher, requests } = fakeFetch([Response.json({ uploadState: "SUCCEEDED", crxVersion: "2.7.0" }), Response.json({ state: "PENDING_REVIEW" })]);

    expect(await publishChrome(options, fetcher, silent)).toBe("PENDING_REVIEW");
    expect(requests.map((r) => [r.init?.method ?? "GET", r.url])).toEqual([
      ["POST", `${CWS_API}/upload/v2/${item}:upload`],
      ["POST", `${CWS_API}/v2/${item}:publish`],
    ]);
    expect(requests[0].init.headers.Authorization).toBe("Bearer ya29.token");
    expect(requests[0].init.body).toEqual(options.zip);
  });

  test("an upload still processing is polled until it succeeds", async () => {
    const { fetcher, requests } = fakeFetch([
      Response.json({ uploadState: "IN_PROGRESS" }),
      Response.json({ lastAsyncUploadState: "IN_PROGRESS" }),
      Response.json({ lastAsyncUploadState: "SUCCEEDED" }),
      Response.json({ state: "PENDING_REVIEW" }),
    ]);

    await publishChrome(options, fetcher, silent);
    expect(requests.map((r) => r.url.split(":").pop())).toEqual(["upload", "fetchStatus", "fetchStatus", "publish"]);
  });

  test("a failed upload is not submitted", async () => {
    const { fetcher, requests } = fakeFetch([Response.json({ uploadState: "FAILED" })]);

    await expect(publishChrome(options, fetcher, silent)).rejects.toThrow("Chrome Web Store upload: FAILED");
    expect(requests).toHaveLength(1);
  });

  test("an HTTP error names the step and the status, not the token", async () => {
    const { fetcher } = fakeFetch([new Response("version must be higher", { status: 400 })]);
    const error = await publishChrome(options, fetcher, silent).catch((e) => e);
    expect(error.message).toBe("Chrome Web Store upload: 400 version must be higher");
    expect(error.message).not.toContain("ya29");
  });
});
