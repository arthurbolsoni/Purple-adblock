// Probe server, 2026-10-08 (ivs_local_probe.py): serves the isolated player page, the IVS SDK bundle and its worker
// files, and an HLS stream from local folders, on 127.0.0.1. Logs every request to stdout as one JSON line.
//   bun docs/findings/probes/ivs_local_server.ts <port> <page folder> <hls folder>
import { join } from "path";

const [port, pageDir, hlsDir] = process.argv.slice(2);

const PAGE = `<!doctype html>
<html><head><meta charset="utf-8"><title>purple l2 probe</title></head>
<body>
<video id="v" playsinline muted style="width:640px"></video>
PURPLE
<script src="/page/ivs.js"></script>
<script>
  const src = new URLSearchParams(location.search).get("src");
  const player = IVSPlayer.create({ wasmWorker: location.origin + "/page/amazon-ivs-wasmworker.min.js", wasmBinary: location.origin + "/page/amazon-ivs-wasmworker.min.wasm" });
  player.attachHTMLVideoElement(document.getElementById("v"));
  player.setMuted(true);
  player.setAutoplay(true);
  window.__playerErrors = [];
  player.addEventListener(IVSPlayer.PlayerEventType.ERROR, (e) => window.__playerErrors.push(JSON.stringify(e).slice(0, 300)));
  player.load(src);
  player.play();
  window.__player = player;
</script>
</body></html>`;

const types: Record<string, string> = { ".js": "text/javascript", ".wasm": "application/wasm", ".m3u8": "application/vnd.apple.mpegurl", ".ts": "video/mp2t" };

Bun.serve({
  port: Number(port),
  hostname: "127.0.0.1",
  async fetch(request) {
    const url = new URL(request.url);
    console.log(JSON.stringify({ at: Date.now(), method: request.method, path: url.pathname }));
    const headers = { "access-control-allow-origin": "*" };
    // ?purple=1: Purple's bundle (purple.js in the page folder) runs first, as the userscript does on twitch.tv
    if (url.pathname === "/page/") {
      const page = PAGE.replace("PURPLE", url.searchParams.get("purple") ? '<script src="/page/purple.js"></script>' : "");
      return new Response(page, { headers: { ...headers, "content-type": "text/html" } });
    }
    const [, root, ...rest] = url.pathname.split("/");
    const dir = root === "page" ? pageDir : root === "hls" ? hlsDir : null;
    if (!dir || rest.some((p) => p === "..")) return new Response("not found", { status: 404, headers });
    const file = Bun.file(join(dir, ...rest));
    if (!(await file.exists())) return new Response("not found", { status: 404, headers });
    const ext = url.pathname.slice(url.pathname.lastIndexOf("."));
    return new Response(file, { headers: { ...headers, "content-type": types[ext] ?? "application/octet-stream" } });
  },
});
console.log(JSON.stringify({ listening: Number(port) }));
