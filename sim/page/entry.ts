// The SDK is a CommonJS bundle; the page gets it as window.IVSPlayer (docs/findings/2026-10-08-level2-player-page.md).
import * as IVSPlayer from "amazon-ivs-player";
(window as any).IVSPlayer = IVSPlayer;
