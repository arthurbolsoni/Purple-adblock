// F-29 (T-829, #112): removals from a SourceBuffer that holds both tracks leave nothing outside the buffered range.
//
// On an fMP4 channel the player appends audio and video to one SourceBuffer and frees the buffer behind the playhead
// with short removals from the start of the buffered range (remove(2, 2.518) every 2 s in Firefox 157). The video
// goes up to its next key frame, the audio only over the range asked, so audio is left behind with no video. When
// the player starts its timeline over at 0 (a viewer's pause and play, F-28's restart), it appends over that audio,
// and Firefox, which reads audio ahead, played it: the sound went between the present and up to a minute before until
// the new appends covered it (docs/findings/2026-11-07-firefox-audio-left-behind.md). Here a removal that starts at
// the start of the buffered range starts at 0, and one that ends at its end goes to the end of the timeline. The
// buffered range is where both tracks have data, so only media that cannot play is removed on top.
type Ranges = { length: number; start(index: number): number; end(index: number): number };

// how close to the buffered start or end a removal counts as starting or ending there, in seconds
const EDGE_S = 0.1;
const AUDIO = /mp4a|opus|ac-3|ec-3|flac|mp3/i;
const VIDEO = /avc1|avc3|hvc1|hev1|av01|vp09|vp8/i;

// The range to remove instead of [start, end), or null to remove it as asked.
export function widenRemoval(buffered: Ranges, start: number, end: number): [number, number] | null {
  if (!buffered || buffered.length === 0) return null;
  const from = start <= buffered.start(0) + EDGE_S ? 0 : start;
  const to = end >= buffered.end(buffered.length - 1) - EDGE_S ? Infinity : end;
  return from === start && to === end ? null : [from, to];
}

// Hooks addSourceBuffer (to know the SourceBuffers whose type names an audio and a video codec) and remove. Returns
// false when the scope has no Media Source.
export function installBufferRemovalWidening(scope: { MediaSource?: any; SourceBuffer?: any }, enabled: () => boolean): boolean {
  const add = scope.MediaSource?.prototype?.addSourceBuffer;
  const remove = scope.SourceBuffer?.prototype?.remove;
  if (typeof add !== "function" || typeof remove !== "function") return false;
  const bothTracks = new WeakSet<object>();

  scope.MediaSource.prototype.addSourceBuffer = function (type: string, ...rest: any[]) {
    const buffer = add.call(this, type, ...rest);
    try {
      if (AUDIO.test(String(type)) && VIDEO.test(String(type))) bothTracks.add(buffer);
    } catch {}
    return buffer;
  };

  scope.SourceBuffer.prototype.remove = function (start: number, end: number) {
    let range: [number, number] = [start, end];
    try {
      if (bothTracks.has(this) && enabled()) range = widenRemoval(this.buffered, start, end) ?? range;
    } catch {
      range = [start, end];
    }
    return remove.call(this, range[0], range[1]);
  };
  return true;
}
