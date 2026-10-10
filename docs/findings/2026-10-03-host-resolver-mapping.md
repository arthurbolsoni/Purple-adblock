# Mapping `*.ttvnw.net` to a local server

Date: 2026-10-03 · Edge 154 · Status: open · Used by: level 2 server design

## Goal

Let the player reach a local server under Twitch's real hostnames, so Purple's URL matching runs unchanged.

## Method

`probes/proxy.ts`: Bun HTTPS server with a self-signed certificate (`CN=ttvnw.net`, SAN `*.ttvnw.net`), logging each request and forwarding it to the real host. `probes/edge_via_proxy.py`: Edge on twitch.tv with `--host-resolver-rules`, `--ignore-certificate-errors`, `--disable-quic`.

## Results

| Attempt | Rule | Server port | Requests reaching the server | Player |
| --- | --- | --- | --- | --- |
| 1 | `MAP *.ttvnw.net 127.0.0.1:8443` | 8443 | 0 | `readyState 0` |
| 2 | `MAP *.ttvnw.net 127.0.0.1` | 443 | 0 | `readyState 0` |

`edge://version` showed `host-resolver-rules` on the command line in attempt 2. The mapping changed resolution (the player stopped loading) but no HTTP request reached the server handler. The TLS handshake was not logged, so a certificate rejection is the leading hypothesis.

## Next checks

- `--ignore-certificate-errors-spki-list=<base64 SHA-256 of the server public key>` instead of `--ignore-certificate-errors`.
- Log TLS handshakes on the server side.
- From an isolated local page (no twitch.tv), `fetch("https://usher.ttvnw.net/...")` and read the error.

## Side note

The cleanup line in that probe had a fallback `taskkill /IM bun.exe`. It did not run (the server process survived and was the only `bun.exe` running), but probes now stop processes by PID only.
