# Third-party notices

Purple Adblock is licensed under the Apache License 2.0 ([LICENSE](LICENSE), [NOTICE](NOTICE)). It carries code from the projects below, under their own licenses.

## TwitchAdSolutions

| | |
| --- | --- |
| Original project | [pixeltris/TwitchAdSolutions](https://github.com/pixeltris/TwitchAdSolutions), by pixeltris (archived) |
| Maintained fork | [ryanbr/TwitchAdSolutions](https://github.com/ryanbr/TwitchAdSolutions), by ryanbr: `vaft/vaft-ublock-origin.js` at commit `74f1248f22a61fcbb559882f93cb60ca25b414e8`. Brave ships the same script in [brave/adblock-resources](https://github.com/brave/adblock-resources) (`resources/vaft-ublock-origin.js`) |
| Code in Purple | `serviceWorker/src/modules/player/blank-segment.ts` (`BLANK_MP4`), `serviceWorker/src/page/player-reload.ts` (`findReactNode`, the player state lookup) |
| Techniques in Purple | the backup access tokens by player type, the blank segment for ad segments, the player reload ([docs/research.md](docs/research.md)) |
| License | MIT |

```
MIT License

Copyright (c) 2020-present TwitchAdSolutions Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
