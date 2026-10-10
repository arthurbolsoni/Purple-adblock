// Replaces tokens, signatures, ids, hosts and addresses in captured Twitch data with fixed values,
// so captures can be committed as fixtures. Applying it twice gives the same result.

const QUERY_PLACEHOLDERS: Record<string, string> = {
  token: "TOKEN",
  sig: "SIG",
  user_id: "USER_ID",
  device_id: "DEVICE_ID",
  play_session_id: "PLAY_SESSION_ID",
};

// X-TV-TWITCH-AD-* attributes that describe the break and carry no identifier.
const AD_ATTRIBUTES_KEPT = new Set([
  "AD-FORMAT",
  "ROLL-TYPE",
  "POD-LENGTH",
  "POD-POSITION",
  "POD-FILLED-DURATION",
  "QUARTILE",
  "LOUDNESS",
  "AF-ICR-MEDIA-DURATION",
  "DSA-VERSION",
  "TRACKING-START",
]);

// X-TTV-MAF-AD-* attributes of a twitch-maf-ad slot (B-032) that describe it and carry no identifier.
const MAF_ATTRIBUTES_KEPT = new Set(["PRIMARY-POD", "FALLBACK-FORMATS", "SDA-SEQUENCE-LENGTH"]);

const JSON_PLACEHOLDERS: Record<string, string> = {
  signature: "SIG",
  sig: "SIG",
  token: "TOKEN",
  user_id: "USER_ID",
  userid: "USER_ID",
  device_id: "DEVICE_ID",
  deviceid: "DEVICE_ID",
  "x-device-id": "DEVICE_ID",
  "device-id": "DEVICE_ID",
  authorization: "OAuth OAUTH",
  "client-integrity": "INTEGRITY",
  "client-session-id": "SESSION_ID",
  "client-version": "CLIENT_VERSION",
  requestid: "REQUEST_ID",
  request_id: "REQUEST_ID",
};

const placeholderFor = (name: string) => name.replace(/-/g, "_");

// Master session data (SESSION-DATA in the page's v2 master, #EXT-X-TWITCH-INFO in v1 masters) that identifies the
// session, the broadcast or the viewer. C and E carry a base64 URL with an opaque path.
const MASTER_PLACEHOLDERS: Record<string, string> = {
  "SERVING-ID": "SERVING_ID",
  "VIDEO-SESSION-ID": "VIDEO_SESSION_ID",
  "BROADCAST-ID": "BROADCAST_ID",
  "USER-COUNTRY": "XX",
  C: "C",
  E: "E",
};
const MASTER_KEYS = Object.keys(MASTER_PLACEHOLDERS).join("|");

export function sanitize(text: string): string {
  const opaque = new Map<string, string>();

  return (
    text
      // query parameters
      .replace(/([?&])(token|sig|user_id|device_id|play_session_id)=[^&\s"#]*/gi, (_, sep, key) => `${sep}${key}=${QUERY_PLACEHOLDERS[key.toLowerCase()]}`)
      // ad attributes that identify the ad, the campaign or the viewer
      .replace(/(X-TV-TWITCH-AD-)([A-Z0-9-]+)="[^"]*"/g, (match, prefix, name) =>
        AD_ATTRIBUTES_KEPT.has(name) ? match : `${prefix}${name}="${placeholderFor(name)}"`,
      )
      .replace(/(X-TTV-MAF-AD-)([A-Z0-9-]+)="[^"]*"/g, (match, prefix, name) =>
        MAF_ATTRIBUTES_KEPT.has(name) ? match : `${prefix}${name}="${placeholderFor(name)}"`,
      )
      // other Twitch ids in playlist attributes
      .replace(/(X-TV-TWITCH-(?!AD-)[A-Z0-9-]*ID)="[^"]*"/g, (_, name) => `${name}="${placeholderFor(name.replace("X-TV-TWITCH-", ""))}"`)
      // master session data
      .replace(new RegExp(`(DATA-ID="(${MASTER_KEYS})",VALUE=)"[^"]*"`, "g"), (_, prefix, key) => `${prefix}"${MASTER_PLACEHOLDERS[key]}"`)
      .replace(/#EXT-X-TWITCH-INFO:[^\n]*/g, (line) =>
        line.replace(new RegExp(`([:,])(${MASTER_KEYS})="[^"]*"`, "g"), (_, sep, key) => `${sep}${key}="${MASTER_PLACEHOLDERS[key]}"`),
      )
      // ad id in the segment title
      .replace(/(#EXTINF:[^,\n]*,Amazon\|)[^\n\r]*/g, "$1AD_ID")
      // edge hosts and addresses
      .replace(/video-edge-[a-z0-9.-]+/gi, "video-edge.example")
      .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "203.0.113.1")
      .replace(/OAuth [A-Za-z0-9]+/g, "OAuth OAUTH")
      // long opaque path components (signed segment and playlist paths)
      .replace(/(\/)([A-Za-z0-9_-]{32,})(?=[./?"\s]|$)/gm, (_, slash, value) => {
        if (!opaque.has(value)) opaque.set(value, `opaque-${opaque.size + 1}`);
        return slash + opaque.get(value);
      })
  );
}

export function sanitizeJson<T>(value: T, parentKey = ""): T {
  if (Array.isArray(value)) return value.map((item) => sanitizeJson(item, parentKey)) as T;
  if (value && typeof value === "object") {
    const out: any = {};
    for (const [key, item] of Object.entries(value)) {
      const placeholder = JSON_PLACEHOLDERS[key.toLowerCase()];
      const isToken = key === "value" && /PlaybackAccessToken$/.test(parentKey);
      if ((placeholder || isToken) && (typeof item === "string" || typeof item === "number")) {
        out[key] = isToken ? "TOKEN" : placeholder;
      } else {
        out[key] = sanitizeJson(item, key);
      }
    }
    return out;
  }
  if (typeof value === "string") return sanitize(value) as T;
  return value;
}

// Sanitizes a fixture file by extension: JSON is walked by key, anything else is treated as text.
export function sanitizeFile(name: string, text: string): string {
  if (name.endsWith(".json")) return JSON.stringify(sanitizeJson(JSON.parse(text)), null, 2) + "\n";
  return sanitize(text);
}
