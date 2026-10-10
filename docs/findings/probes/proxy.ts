// Probe, 2026-10-03. Local TLS server for *.ttvnw.net that logs and forwards requests. Needs key.pem/cert.pem in the working dir: openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 2 -subj "/CN=ttvnw.net" -addext "subjectAltName=DNS:*.ttvnw.net". Run: PORT=443 bun proxy.ts
// Finding: docs/findings/2026-10-03-host-resolver-mapping.md
// Edge 154 + nodriver 0.50.3, dedicated profile ~/nodriver/profile-edge-purple.
const counts: Record<string, number> = {};
const statuses: Record<string, number> = {};
const server = Bun.serve({
  port: Number(process.env.PORT ?? 8443),
  hostname: "127.0.0.1",
  tls: { key: Bun.file("key.pem"), cert: Bun.file("cert.pem") },
  async fetch(req) {
    const url = new URL(req.url);
    const host = req.headers.get("host") ?? url.host;
    const kind = host.startsWith("usher.") ? "usher" : url.pathname.endsWith(".m3u8") ? "media" : url.pathname.endsWith(".ts") ? "segment" : "other";
    counts[kind] = (counts[kind] ?? 0) + 1;
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: { "access-control-allow-origin": req.headers.get("origin") ?? "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET,POST,OPTIONS" } });
    }
    const upstream = await fetch(`https://${host}${url.pathname}${url.search}`, { headers: { "user-agent": req.headers.get("user-agent") ?? "" } });
    statuses[`${kind}:${upstream.status}`] = (statuses[`${kind}:${upstream.status}`] ?? 0) + 1;
    const headers = new Headers();
    for (const h of ["content-type", "cache-control"]) { const v = upstream.headers.get(h); if (v) headers.set(h, v); }
    headers.set("access-control-allow-origin", req.headers.get("origin") ?? "*");
    headers.set("x-purple-sim", "1");
    return new Response(await upstream.arrayBuffer(), { status: upstream.status, headers });
  },
});
setInterval(() => Bun.write("counts.json", JSON.stringify({ counts, statuses })), 1000);
console.log("listening", server.url.href);
