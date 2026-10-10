// T-703: signed releases. Firefox through addons.mozilla.org with web-ext (listed for a release, so AMO reviews it and
// its users get the update, and with --wait the signed .xpi once approved, for the GitHub release; unlisted for a
// pre-release, a signed .xpi for the GitHub pre-release). Chrome through the Chrome Web Store API v2: the zip is
// uploaded and submitted for review; the store signs and publishes it once approved.
//
//   bun cli/publish.ts firefox --channel listed|unlisted [--wait] [--tag <pre-release tag>] [--dry-run]
//   bun cli/publish.ts chrome [--dry-run]
//
// Both run after `bun run build` (serviceWorker/dist/bundle.js, dist/purple-adblock-<version>-chromium.zip).
// Credentials come from the environment: GitHub secrets in the release workflows, or a local .env, which Bun loads.
// None of them is printed or passed on a command line.
//   Firefox: AMO_JWT_ISSUER, AMO_JWT_SECRET (https://addons.mozilla.org/developers/addon/api/key/)
//   Chrome:  CWS_PUBLISHER_ID, and CWS_SERVICE_ACCOUNT_JSON (the service account's JSON key) or CWS_CLIENT_ID,
//            CWS_CLIENT_SECRET and CWS_REFRESH_TOKEN; CWS_ITEM_ID defaults to the published item
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { buildFirefox } from "./firefox_builder.js";
import { signedXpiName, unpackedName } from "./files.js";

export const AMO_ADDON_ID = "{a7399979-5203-4489-9861-b168187b52e1}";
export const CWS_ITEM_ID = "lkgcfobnmghhbhgekffaadadhmeoindg";
export const CWS_API = "https://chromewebstore.googleapis.com";
export const CWS_SCOPE = "https://www.googleapis.com/auth/chromewebstore";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
// how long web-ext waits for AMO to sign: always for unlisted, which AMO signs automatically, usually within minutes;
// for listed only with --wait (signed once approved), else it is submitted for review with nothing to wait for
export const APPROVAL_MS = 15 * 60_000;

type Env = Record<string, string | undefined>;
type Log = (line: string) => void;

// Firefox wants up to four dot-separated numbers without leading zeros. A release uses the package version; a
// pre-release tag `<version>-<label>.<n>` (2.7.0-beta.1) gets `<version>.<n>` (2.7.0.1), unique on AMO
export function firefoxVersion(version: string, tag?: string): string {
  if (!/^(0|[1-9]\d{0,8})(\.(0|[1-9]\d{0,8})){0,3}$/.test(version)) throw new Error(`package version ${version}: not a Firefox version`);
  if (!tag) return version;
  const match = /^(.+)-[0-9A-Za-z]+\.([1-9]\d{0,8})$/.exec(tag);
  if (!match || match[1] !== version || version.split(".").length > 3) {
    throw new Error(`pre-release tag ${tag}: expected ${version}-<label>.<number> (for instance ${version}-beta.1)`);
  }
  return `${version}.${match[2]}`;
}

const required = (env: Env, names: string[]): string[] => {
  const missing = names.filter((name) => !env[name]);
  if (missing.length) throw new Error(`missing in the environment: ${missing.join(", ")}`);
  return names.map((name) => env[name]!);
};

// web-ext reads WEB_EXT_<OPTION> from the environment: the key and secret never reach the command line
export function webExtSign(options: { channel: "listed" | "unlisted"; wait?: boolean; sourceDir: string; artifactsDir: string; sourceArchive: string; metadata: string; env: Env }) {
  const [issuer, secret] = required(options.env, ["AMO_JWT_ISSUER", "AMO_JWT_SECRET"]);
  const args = [
    "sign",
    "--channel", options.channel,
    "--source-dir", options.sourceDir,
    "--artifacts-dir", options.artifactsDir,
    "--upload-source-code", options.sourceArchive,
    "--amo-metadata", options.metadata,
    "--approval-timeout", String(options.channel === "listed" && !options.wait ? 0 : APPROVAL_MS),
    "--no-input",
  ];
  return { args, env: { WEB_EXT_API_KEY: issuer, WEB_EXT_API_SECRET: secret } };
}

export type FirefoxDeps = {
  build: (out: string) => Promise<void>;
  run: (cmd: string[], env?: Env) => Promise<void>;
  log: Log;
};

const defaultFirefoxDeps = (): FirefoxDeps => ({
  build: (out) => buildFirefox(true, { out }),
  run: async (cmd, env = {}) => {
    const proc = Bun.spawn(cmd, { env: { ...process.env, ...env }, stdout: "inherit", stderr: "inherit" });
    if ((await proc.exited) !== 0) throw new Error(`${cmd.slice(0, 4).join(" ")} exited with ${proc.exitCode}`);
  },
  log: (line) => console.log(line),
});

// What AMO gets with each version (web-ext --amo-metadata, the version's fields): the license, an AMO slug from
// package.json (T-706), and how its reviewers rebuild the minified bundle from the attached source
export function amoMetadata(packageJson: { version: string; license: string }) {
  return {
    version: {
      license: packageJson.license,
      approval_notes:
        "Built from the attached source with Bun 1.4.1: `bun install --frozen-lockfile`, then `bun run build`. " +
        `The package is dist/purple-adblock-${packageJson.version}-firefox.zip, with the files of this upload ` +
        "(app/bundle.js is the minified worker bundle from serviceWorker/src). Third-party code: THIRD-PARTY-NOTICES.md.",
    },
  };
}

// The unpacked build (the release zip's content) with the Firefox version, the repository's source for AMO's review
// (the bundle is minified), then web-ext sign. Unlisted, or listed with wait: the signed .xpi goes to
// dist/purple-adblock-<version>-firefox-signed.xpi
export async function signFirefox(
  options: { channel: "listed" | "unlisted"; wait?: boolean; tag?: string; dryRun?: boolean; env: Env; root?: string },
  deps: FirefoxDeps = defaultFirefoxDeps(),
): Promise<string | null> {
  const root = options.root ?? ".";
  const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const version = firefoxVersion(packageJson.version, options.tag);
  const work = join(root, "dist", "sign");
  const sourceDir = join(work, unpackedName("firefox"));
  const artifactsDir = join(work, "artifacts");
  // in the work folder, so the release workflows do not attach it with dist/*.zip
  const sourceArchive = join(work, `purple-adblock-${version}-source.zip`);
  const metadata = join(work, "amo-metadata.json");
  const sign = webExtSign({ channel: options.channel, wait: options.wait, sourceDir, artifactsDir, sourceArchive, metadata, env: options.dryRun ? { AMO_JWT_ISSUER: "-", AMO_JWT_SECRET: "-" } : options.env });

  deps.log(`Firefox ${version}, ${options.channel}${options.dryRun ? " (dry run)" : ""}`);
  rmSync(work, { recursive: true, force: true });
  mkdirSync(work, { recursive: true });
  await deps.build(work);
  const manifestPath = join(sourceDir, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.browser_specific_settings?.gecko?.id !== AMO_ADDON_ID) throw new Error(`manifest add-on ID is not ${AMO_ADDON_ID}`);
  manifest.version = version;
  writeFileSync(manifestPath, JSON.stringify(manifest));
  writeFileSync(metadata, JSON.stringify(amoMetadata(packageJson), null, 2));
  await deps.run(["git", "archive", "--format=zip", `--output=${sourceArchive}`, "HEAD"]);

  const command = ["bun", "--bun", "x", "web-ext", ...sign.args];
  if (options.dryRun) {
    deps.log(`would run: ${command.join(" ")}`);
    return null;
  }
  await deps.run(command, sign.env);
  if (options.channel === "listed" && !options.wait) {
    deps.log(`Firefox ${version} submitted to addons.mozilla.org for review`);
    return null;
  }
  const xpi = existsSync(artifactsDir) ? readdirSync(artifactsDir).find((name) => name.endsWith(".xpi")) : undefined;
  if (!xpi) throw new Error(`no signed .xpi in ${artifactsDir}`);
  const signed = join(root, "dist", signedXpiName(version));
  renameSync(join(artifactsDir, xpi), signed);
  deps.log(`Firefox ${version} signed: ${signed}`);
  return signed;
}

const base64url = (data: ArrayBuffer | Uint8Array | string) =>
  Buffer.from(typeof data === "string" ? data : data instanceof Uint8Array ? data : new Uint8Array(data)).toString("base64url");

// A service account's JSON key signs a JWT (RS256) that Google exchanges for an access token
export async function serviceAccountAssertion(account: { client_email: string; private_key: string; token_uri?: string }, now = Date.now()) {
  const der = Buffer.from(account.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, ""), "base64");
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const iat = Math.floor(now / 1000);
  const unsigned = `${base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64url(JSON.stringify({ iss: account.client_email, scope: CWS_SCOPE, aud: account.token_uri ?? GOOGLE_TOKEN_URL, iat, exp: iat + 3600 }))}`;
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  return `${unsigned}.${base64url(signature)}`;
}

// An access token for the Chrome Web Store API: from the service account when there is one, else from the OAuth
// client's refresh token
export async function chromeToken(env: Env, fetcher: typeof fetch = fetch, now = Date.now()): Promise<string> {
  let body: URLSearchParams;
  let url = GOOGLE_TOKEN_URL;
  if (env.CWS_SERVICE_ACCOUNT_JSON) {
    const account = JSON.parse(env.CWS_SERVICE_ACCOUNT_JSON);
    url = account.token_uri ?? GOOGLE_TOKEN_URL;
    body = new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: await serviceAccountAssertion(account, now) });
  } else {
    const [clientId, clientSecret, refreshToken] = required(env, ["CWS_CLIENT_ID", "CWS_CLIENT_SECRET", "CWS_REFRESH_TOKEN"]);
    body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" });
  }
  const response = await fetcher(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const json: any = await response.json().catch(() => ({}));
  if (!response.ok || !json.access_token) throw new Error(`Google token request: ${response.status} ${json.error ?? ""}`.trim());
  return json.access_token;
}

// The status and, for a Google API error, its message, reasons and precondition violations (a failed install test, a
// missing permission justification); any other body up to 300 characters
const describe = async (response: Response) => {
  const text = await response.text().catch(() => "");
  try {
    const { error } = JSON.parse(text);
    const details: any[] = error.details ?? [];
    const reasons = details.filter((detail) => detail.reason).map((detail) => detail.reason);
    const violations = details.flatMap((detail) => detail.violations ?? []).map((violation: any) => `${violation.type}: ${violation.description}`);
    return [`${response.status} ${error.message}`, ...reasons, ...violations].join("\n");
  } catch {
    return `${response.status} ${text.slice(0, 300)}`;
  }
};

// Upload, wait while the store processes it (fetchStatus), then submit for review (published once approved)
export async function publishChrome(
  options: { zip: Uint8Array; publisherId: string; itemId: string; token: string; pollMs?: number; polls?: number },
  fetcher: typeof fetch = fetch,
  log: Log = (line) => console.log(line),
): Promise<string> {
  const item = `publishers/${options.publisherId}/items/${options.itemId}`;
  const auth = { Authorization: `Bearer ${options.token}` };
  const uploaded = await fetcher(`${CWS_API}/upload/v2/${item}:upload`, { method: "POST", headers: { ...auth, "Content-Type": "application/zip" }, body: options.zip });
  if (!uploaded.ok) throw new Error(`Chrome Web Store upload: ${await describe(uploaded)}`);
  let state: string = (await uploaded.json()).uploadState;
  for (let i = 0; state === "IN_PROGRESS" && i < (options.polls ?? 60); i++) {
    await Bun.sleep(options.pollMs ?? 5000);
    const status = await fetcher(`${CWS_API}/v2/${item}:fetchStatus`, { headers: auth });
    if (!status.ok) throw new Error(`Chrome Web Store fetchStatus: ${await describe(status)}`);
    state = (await status.json()).lastAsyncUploadState;
  }
  if (state !== "SUCCEEDED") throw new Error(`Chrome Web Store upload: ${state}`);
  log("Chrome Web Store: package uploaded");
  const published = await fetcher(`${CWS_API}/v2/${item}:publish`, { method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: "{}" });
  if (!published.ok) throw new Error(`Chrome Web Store publish: ${await describe(published)}`);
  const result: any = await published.json();
  log(`Chrome Web Store: submitted, state ${result.state ?? "unknown"}`);
  return result.state ?? "";
}

async function main(argv: string[], env: Env) {
  const [target, ...rest] = argv;
  const flag = (name: string) => {
    const at = rest.indexOf(name);
    return at >= 0 ? rest[at + 1] : undefined;
  };
  const dryRun = rest.includes("--dry-run");
  if (target === "firefox") {
    const channel = flag("--channel");
    if (channel !== "listed" && channel !== "unlisted") throw new Error("--channel listed|unlisted");
    await signFirefox({ channel, wait: rest.includes("--wait"), tag: flag("--tag"), dryRun, env });
    return;
  }
  if (target === "chrome") {
    const version = JSON.parse(readFileSync("package.json", "utf8")).version;
    const zipPath = join("dist", `purple-adblock-${version}-chromium.zip`);
    if (!existsSync(zipPath)) throw new Error(`${zipPath} not found: run bun run build first`);
    if (dryRun) {
      console.log(`would upload ${zipPath} to item ${env.CWS_ITEM_ID ?? CWS_ITEM_ID} and submit it for review`);
      return;
    }
    const [publisherId] = required(env, ["CWS_PUBLISHER_ID"]);
    const token = await chromeToken(env);
    await publishChrome({ zip: new Uint8Array(readFileSync(zipPath)), publisherId, itemId: env.CWS_ITEM_ID ?? CWS_ITEM_ID, token });
    return;
  }
  throw new Error("usage: bun cli/publish.ts firefox --channel listed|unlisted [--wait] [--tag <tag>] [--dry-run] | chrome [--dry-run]");
}

if (import.meta.main) {
  main(process.argv.slice(2), process.env).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
