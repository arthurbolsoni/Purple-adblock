import { Player } from "./player/player";

declare global {
  var realFetch: any;
  var LogPrint: any;
  var onEventMessage: any;
  var player: any;
}

export function app(scope: any) {
  scope.LogPrint = (x: any) => console.log("[Purple]: ", x);
  scope.addEventListener("message", (e: any) => {
    global.onEventMessage(e);
  });

  const player = new Player();

  global.realFetch = global.fetch
  global.player = player;

  player.inflateFetch();
  scope.LogPrint("Script running");
}

app(global);