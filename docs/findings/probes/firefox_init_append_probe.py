"""What Firefox's decoders do when an fMP4 init segment comes again in one Media Source buffer (T-829, 2026-11-07).

Usage: python docs/findings/probes/firefox_init_append_probe.py <fMP4 channel login> [--out DIR] [--segments N]

On an fMP4 channel the player appends both tracks to one SourceBuffer, and with Purple it appends the `EXT-X-MAP` init
segment again at almost every change of source inside a break (23 times in an 80 s midroll on Brave, 2026-11-06). This
probe repeats those appends outside Twitch's page:

1. Downloads, from a live fMP4 channel, N consecutive live segments (default 8) and their init segments from a `site`
   token at 720p and 360p and from a `popout` token at 720p (same live numbers, EXT-X-TWITCH-LIVE-SEQUENCE), into
   --out (default ~/purple-recordings/<date>-t829-init/media). Prints whether the two tokens' 720p init segments have
   the same bytes.
2. Serves them and a test page on 127.0.0.1 and opens the page in Firefox (e2e/firefox.py, PURPLE_FIREFOX, no add-on)
   with MOZ_LOG "timestamp,MediaFormatReader:4" written to --out. Each scenario gets a new <video> and MediaSource with
   one SourceBuffer for both tracks (`video/mp4; codecs="avc1...,mp4a.40.2"`), appends its list in order, plays from the
   start of the buffered range to its end and records `waiting` events, the time it took and the dropped frames:
   - baseline: the 720p init, then the N segments;
   - same-init: the same 720p init bytes again before every segment;
   - other-token: the `site` and the `popout` 720p init and segments in turn, as Purple's backups;
   - rendition: 720p, then 2 segments at 360p with their init, then 720p again with its init, as Purple's trips to a
     360p backup;
   - live, live-repeat, live-repeat-other: appended as the live player does (the init and 2 segments, play, then one
     segment every 2 s), the last two with the 4th segment appended twice in a row, from the same token or, with its
     init, from the other one: the player fetching the segment it just got (2.7.0 at midroll starts, T-825).
3. Reads the media log per scenario (each one's MediaFormatReader) with firefox_media_log_probe.read_log: stream id
   changes, decoder inits, and decoded audio or video starting before (`back`) or after (`gap`) the end of the output
   before it.
"""
import argparse
import asyncio
import datetime
import hashlib
import http.server
import json
import os
import sys
import threading
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', 'e2e'))
import fmp4_track_times_probe as fmp4  # noqa: E402
import firefox_media_log_probe as medialog  # noqa: E402
import firefox  # noqa: E402

PAGE = """<!doctype html><meta charset="utf-8"><body><script>
const appendOne = (sb, data) => new Promise((resolve, reject) => {
  sb.addEventListener('updateend', resolve, { once: true });
  sb.addEventListener('error', () => reject(new Error('append error')), { once: true });
  sb.appendBuffer(data);
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function run(name, files, codecs, paced) {
  const video = document.createElement('video');
  video.muted = false;
  document.body.appendChild(video);
  const ms = new MediaSource();
  video.src = URL.createObjectURL(ms);
  await new Promise((r) => ms.addEventListener('sourceopen', r, { once: true }));
  const sb = ms.addSourceBuffer('video/mp4; codecs="' + codecs + '"');
  const started = Date.now();
  const data = [];
  for (const file of files) data.push(new Uint8Array(await (await fetch('/media/' + file)).arrayBuffer()));
  let waiting = 0;
  video.addEventListener('waiting', () => waiting++);
  let playStart;
  if (paced) {
    // as the live player: the first `paced.lead` entries, play, then one entry every `paced.every` ms
    for (const d of data.slice(0, paced.lead)) await appendOne(sb, d);
    video.currentTime = sb.buffered.start(0);
    playStart = Date.now();
    await video.play().catch(() => {});
    for (const d of data.slice(paced.lead)) { if (d.byteLength > 3000) await wait(paced.every); await appendOne(sb, d); }
  } else {
    for (const d of data) await appendOne(sb, d);
  }
  ms.endOfStream();
  const ranges = [];
  for (let i = 0; i < sb.buffered.length; i++) ranges.push([sb.buffered.start(i), sb.buffered.end(i)]);
  if (!paced) {
    video.currentTime = ranges.length ? ranges[0][0] : 0;
    playStart = Date.now();
    await video.play().catch(() => {});
  }
  const end = ranges.length ? ranges[ranges.length - 1][1] : 0;
  while (!video.ended && Date.now() - playStart < 60000) await wait(100);
  const q = video.getVideoPlaybackQuality();
  const out = { name, started, ended: Date.now(), ranges, waiting, played: (Date.now() - playStart) / 1000,
    media: end - (ranges.length ? ranges[0][0] : 0), dropped: q.droppedVideoFrames, total: q.totalVideoFrames, error: video.error && video.error.code };
  video.remove();
  return out;
}
window.runAll = async (scenarios, codecs) => {
  const results = [];
  for (const s of scenarios) { results.push(await run(s.name, s.files, codecs, s.paced)); await wait(2000); }
  return results;
};
</script>"""


def download(login, out, count):
    if os.path.exists(os.path.join(out, f'site-720-{count - 1}.mp4')):
        print('media already in', out)
        return 'avc1.4D401F,mp4a.40.2'
    os.makedirs(out, exist_ok=True)
    playlists = {}
    for player_type in ('site', 'popout'):
        found = fmp4.variants(fmp4.master(login, fmp4.token(login, player_type)))
        high = '720p60' if '720p60' in found else next(n for n in sorted(found) if n.startswith('720p'))
        low = '360p30' if '360p30' in found else next(n for n in sorted(found) if n.startswith('360p'))
        playlists[(player_type, '720')] = found[high]
        if player_type == 'site':
            playlists[(player_type, '360')] = found[low]
    listed = {key: fmp4.segments(fmp4.get(url).decode()) for key, url in playlists.items()}
    common = sorted(set.intersection(*(set(s) for s in listed.values())))
    if len(common) < count:
        raise RuntimeError(f'only {len(common)} live numbers in every playlist')
    numbers = common[-count - 1:-1]  # not the newest: it can still be growing
    names = {}
    for (player_type, height), segs in listed.items():
        prefix = f'{player_type}-{height}'
        maps = {segs[n][1] for n in numbers}
        if len(maps) != 1:
            raise RuntimeError(f'{prefix}: {len(maps)} init segments over the live numbers')
        with open(os.path.join(out, f'{prefix}-init.mp4'), 'wb') as f:
            f.write(fmp4.get(maps.pop()))
        for i, n in enumerate(numbers):
            with open(os.path.join(out, f'{prefix}-{i}.mp4'), 'wb') as f:
                f.write(fmp4.get(segs[n][0]))
        names[prefix] = prefix
    digest = lambda name: hashlib.sha256(open(os.path.join(out, name), 'rb').read()).hexdigest()
    same = digest('site-720-init.mp4') == digest('popout-720-init.mp4')
    print(f'live numbers {numbers[0]} to {numbers[-1]}; site and popout 720p init segments '
          f"{'have the same bytes' if same else 'differ'}; same media bytes for live {numbers[0]}: "
          f"{digest('site-720-0.mp4') == digest('popout-720-0.mp4')}")
    codecs = 'avc1.4D401F,mp4a.40.2'
    return codecs


def scenarios(count):
    s720 = [f'site-720-{i}.mp4' for i in range(count)]
    other = []
    for i in range(count):
        token = 'site' if i % 2 == 0 else 'popout'
        other += [f'{token}-720-init.mp4', f'{token}-720-{i}.mp4']
    rendition = ['site-720-init.mp4', 'site-720-0.mp4', 'site-720-1.mp4', 'site-360-init.mp4', 'site-360-2.mp4', 'site-360-3.mp4',
                 'site-720-init.mp4'] + [f'site-720-{i}.mp4' for i in range(4, count)]
    return [
        {'name': 'baseline', 'files': ['site-720-init.mp4'] + s720},
        {'name': 'same-init', 'files': [f for name in s720 for f in ('site-720-init.mp4', name)]},
        {'name': 'other-token', 'files': other},
        {'name': 'rendition', 'files': rendition},
        {'name': 'live', 'files': ['site-720-init.mp4'] + s720, 'paced': {'lead': 3, 'every': 2000}},
        {'name': 'live-repeat', 'files': ['site-720-init.mp4'] + s720[:4] + [s720[3]] + s720[4:], 'paced': {'lead': 3, 'every': 2000}},
        {'name': 'live-repeat-other', 'files': ['site-720-init.mp4'] + s720[:4] + ['popout-720-init.mp4', s720[3].replace('site', 'popout')]
         + ['site-720-init.mp4'] + s720[4:], 'paced': {'lead': 3, 'every': 2000}},
    ]


def serve(media):
    class Handler(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path.startswith('/media/'):
                path = os.path.join(media, os.path.basename(self.path))
                data, kind = open(path, 'rb').read(), 'video/mp4'
            else:
                data, kind = PAGE.encode(), 'text/html'
            self.send_response(200)
            self.send_header('Content-Type', kind)
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def log_message(self, *args):
            pass

    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server


async def drive(port, plan, codecs, log_dir):
    env = {'MOZ_LOG': 'timestamp,MediaFormatReader:4', 'MOZ_LOG_FILE': os.path.join(log_dir, 'mozlog.txt')}
    browser = await firefox.Firefox.launch(build=None, env=env)
    try:
        await browser.navigate(f'http://127.0.0.1:{port}/', wait='complete')
        result = await browser.send('script.evaluate', {'expression': f'runAll({json.dumps(plan)}, {json.dumps(codecs)}).then(JSON.stringify)',
                                                        'target': {'context': browser.context}, 'awaitPromise': True, 'resultOwnership': 'none'})
        if result.get('type') != 'success':
            raise RuntimeError(result)
        return json.loads(result['result']['value'])
    finally:
        await browser.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('login')
    ap.add_argument('--out', default=os.path.expanduser(f'~/purple-recordings/{datetime.date.today().isoformat()}-t829-init'))
    ap.add_argument('--segments', type=int, default=8)
    args = ap.parse_args()
    media, log_dir = os.path.join(args.out, 'media'), os.path.join(args.out, 'log')
    os.makedirs(log_dir, exist_ok=True)
    codecs = download(args.login, media, args.segments)
    server = serve(media)
    plan = scenarios(args.segments)
    results = asyncio.run(drive(server.server_address[1], plan, codecs, log_dir))
    server.shutdown()
    time.sleep(1)
    readers = medialog.read_log(log_dir, 5000)
    ordered = sorted((data for data in readers.values() if data['outputs']), key=lambda data: data['first'])
    for result in results:
        data = next((d for d in ordered if result['started'] - 500 <= d['first'] <= result['ended']), None)
        events = data['events'] if data else []
        kinds = {}
        for _, kind, value in events:
            entry = kinds.setdefault(kind, [0, 0.0])
            entry[0] += 1
            entry[1] += value if isinstance(value, float) else 0
        text = '; '.join(f'{k} {n}' + (f' ({ms:.0f} ms)' if k.endswith(('back', 'gap')) else '') for k, (n, ms) in sorted(kinds.items()))
        print(f"{result['name']:12} media {result['media']:.2f} s, played in {result['played']:.2f} s, waiting {result['waiting']},"
              f" ranges {len(result['ranges'])}, dropped {result['dropped']}/{result['total']}, error {result['error']}")
        print(f"{'':12} media log: {text or 'no events'}")


if __name__ == '__main__':
    sys.exit(main())
