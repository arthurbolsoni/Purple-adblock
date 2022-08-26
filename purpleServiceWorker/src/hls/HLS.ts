export class HLS {
  private _header: Array<string> = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-TARGETDURATION:6", "#EXT-X-MEDIA-SEQUENCE:"];
  private _playlist: playlistItem[] = [];
  private _sequence = 0;

  addPlaylistTest(playlist: string){

  }

  addPlaylist(playlist: string): boolean {
    if (playlist === null) {
      return false;
    }

    let changed = false;

    const lines = playlist.toString().split(/[\r\n]/);
    this._header[4] = lines[4];
    this._header[5] = lines[5];

    //take all m3u9 content to the playlist and build a varible
    for (const i in lines) {
      if (lines[i].includes("#EXTINF") && lines[i].includes(",live")) {
        //timestamp sequence
        const sequenceTimestamp = Math.floor(new Date(lines[parseInt(i) - 1].slice(lines[parseInt(i) - 1].length - 24, lines[parseInt(i) - 1].length)).getTime() / 1000);

        //select all sequence that no exist
        const r = this._playlist.filter((x) => {
          return x.timestamp >= sequenceTimestamp;
        });
        //add the sequence on playlist variable if it no exist
        if (!r.length) {
          this._sequence = this._sequence + 1;
          this._playlist.push({
            time: lines[parseInt(i) - 1],
            timestamp: sequenceTimestamp,
            info: lines[parseInt(i)],
            url: lines[parseInt(i) + 1],
          });
          changed = true;
        }
        while (this._playlist.length > 15) {
          this._playlist.shift();
        }
      }
    }
    return changed;
  }

  getPlaylist(): String {
    return (
      this._header[0] +
      "\n" +
      this._header[1] +
      "\n" +
      this._header[2] +
      "\n" +
      this._header[3] +
      this._sequence +
      "\n" +
      this._header[4] +
      "\n" +
      this._header[5] +
      "\n" +
      this._playlist.map((x) => {
        return x.time + "\n" + x.info + "\n" + x.url + "\n";
      })
    );
  }
}
