import { describe, expect, test } from "bun:test";
import { sanitize, sanitizeFile, sanitizeJson } from "./sanitize";

const RAW_MEDIA = `#EXTM3U
#EXT-X-DATERANGE:ID="playlist-session-1",CLASS="twitch-session",START-DATE="2026-10-03T12:00:00.000Z",END-ON-NEXT=YES,X-TV-TWITCH-SESSIONID="a1b2c3d4e5"
#EXT-X-DATERANGE:ID="stitched-ad-1",CLASS="twitch-stitched-ad",START-DATE="2026-10-03T12:00:00.000Z",DURATION=30.000,X-TV-TWITCH-AD-ROLL-TYPE="PREROLL",X-TV-TWITCH-AD-POD-LENGTH="2",X-TV-TWITCH-AD-AD-SESSION-ID="9f8e7d6c",X-TV-TWITCH-AD-CREATIVE-ID="123456",X-TV-TWITCH-AD-RADS-TOKEN="eyJhbGciOi",X-TV-TWITCH-AD-CLICK-TRACKING-URL="https://ads.twitch.tv/click?u=42"
#EXT-X-PROGRAM-DATE-TIME:2026-10-03T12:00:00.000Z
#EXTINF:2.000,Amazon|987654321
https://d2abc.j.cloudfront.hls.ttvnw.net/v1/segment/CqkF8xH2b9aZ3kLmNoPqRsTuVwXyZ0123456789abcdef.ts
#EXTINF:2.000,live
https://d2abc.j.cloudfront.hls.ttvnw.net/v1/segment/CqkF8xH2b9aZ3kLmNoPqRsTuVwXyZ0123456789abcdef.ts?x=1
`;

describe("sanitize (text)", () => {
  const out = sanitize(RAW_MEDIA);

  test("replaces ad ids and keeps the break description", () => {
    expect(out).toContain('X-TV-TWITCH-AD-AD-SESSION-ID="AD_SESSION_ID"');
    expect(out).toContain('X-TV-TWITCH-AD-CREATIVE-ID="CREATIVE_ID"');
    expect(out).toContain('X-TV-TWITCH-AD-RADS-TOKEN="RADS_TOKEN"');
    expect(out).toContain('X-TV-TWITCH-AD-CLICK-TRACKING-URL="CLICK_TRACKING_URL"');
    expect(out).toContain('X-TV-TWITCH-AD-ROLL-TYPE="PREROLL"');
    expect(out).toContain('X-TV-TWITCH-AD-POD-LENGTH="2"');
    expect(out).not.toContain("9f8e7d6c");
    expect(out).not.toContain("ads.twitch.tv/click");
  });

  test("replaces the session id and the ad id in the segment title", () => {
    expect(out).toContain('X-TV-TWITCH-SESSIONID="SESSIONID"');
    expect(out).toContain("#EXTINF:2.000,Amazon|AD_ID");
    expect(out).toContain("#EXTINF:2.000,live");
    expect(out).not.toContain("987654321");
  });

  test("replaces long opaque path components with stable names", () => {
    expect(out).toContain("https://d2abc.j.cloudfront.hls.ttvnw.net/v1/segment/opaque-1.ts\n");
    expect(out).toContain("https://d2abc.j.cloudfront.hls.ttvnw.net/v1/segment/opaque-1.ts?x=1");
    expect(out).not.toContain("CqkF8xH2b9aZ");
  });

  test("keeps every other line as is", () => {
    const keep = (text: string) => text.split("\n").filter((l) => l.startsWith("#EXTM3U") || l.startsWith("#EXT-X-PROGRAM-DATE-TIME"));
    expect(keep(out)).toEqual(keep(RAW_MEDIA));
    expect(out.split("\n")).toHaveLength(RAW_MEDIA.split("\n").length);
  });

  test("replaces token, sig, user and device ids in URLs", () => {
    const url =
      "https://usher.ttvnw.net/api/channel/hls/channel.m3u8?allow_source=true&sig=0a1b2c3d&token=%7B%22user_id%22%3A1%7D&user_id=42&device_id=abcDEF&p=1234567";
    expect(sanitize(url)).toBe("https://usher.ttvnw.net/api/channel/hls/channel.m3u8?allow_source=true&sig=SIG&token=TOKEN&user_id=USER_ID&device_id=DEVICE_ID&p=1234567");
  });

  test("replaces edge hosts, IPv4 addresses and OAuth tokens", () => {
    expect(sanitize('#EXT-X-SESSION-DATA:DATA-ID="NODE",VALUE="video-edge-4f2a1c.fra06"')).toBe('#EXT-X-SESSION-DATA:DATA-ID="NODE",VALUE="video-edge.example"');
    expect(sanitize('VALUE="177.12.34.56"')).toBe('VALUE="203.0.113.1"');
    expect(sanitize("Authorization: OAuth abc123def456")).toBe("Authorization: OAuth OAUTH");
  });

  test("leaves codecs, versions and timestamps alone", () => {
    const text = 'CODECS="avc1.64002A,mp4a.40.2",VALUE="1791028800.00",hvc1.2.4.L153.B0,FRAME-RATE=60.000';
    expect(sanitize(text)).toBe(text);
  });

  test("is idempotent", () => {
    expect(sanitize(out)).toBe(out);
  });
});

describe("sanitizeJson", () => {
  test("replaces the token value, signature and ids by key", () => {
    const raw = {
      data: {
        streamPlaybackAccessToken: { value: '{"user_id":42,"channel":"x"}', signature: "0a1b2c", __typename: "PlaybackAccessToken" },
      },
      extensions: { requestID: "01HXYZ", operationName: "PlaybackAccessToken" },
    };
    expect(sanitizeJson(raw)).toEqual({
      data: { streamPlaybackAccessToken: { value: "TOKEN", signature: "SIG", __typename: "PlaybackAccessToken" } },
      extensions: { requestID: "REQUEST_ID", operationName: "PlaybackAccessToken" },
    });
  });

  test("replaces captured page headers and keeps the public Client-ID", () => {
    const headers = {
      "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko",
      "Client-Integrity": "v4.public.eyJ",
      "X-Device-Id": "Ab12Cd34",
      Authorization: "OAuth abc123",
      "Client-Version": "5d1f2b3c-aaaa",
      "Client-Session-Id": "f00dbabe",
    };
    expect(sanitizeJson({ headers })).toEqual({
      headers: {
        "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko",
        "Client-Integrity": "INTEGRITY",
        "X-Device-Id": "DEVICE_ID",
        Authorization: "OAuth OAUTH",
        "Client-Version": "CLIENT_VERSION",
        "Client-Session-Id": "SESSION_ID",
      },
    });
  });

  test("sanitizes strings inside arrays and nested objects as text", () => {
    expect(sanitizeJson({ urls: ["https://x/?token=abc&sig=def"] })).toEqual({ urls: ["https://x/?token=TOKEN&sig=SIG"] });
  });

  test("sanitizeFile picks JSON or text by extension", () => {
    expect(sanitizeFile("a.json", '{"signature":"x"}')).toBe('{\n  "signature": "SIG"\n}\n');
    expect(sanitizeFile("a.m3u8", "#EXTINF:2.000,Amazon|1\n")).toBe("#EXTINF:2.000,Amazon|AD_ID\n");
  });
});
