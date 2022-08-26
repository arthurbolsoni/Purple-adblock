import { Player } from "./player/player";

declare global {
  var realFetch: any;
  var LogPrint: any;
  var onEventMessage: any;
  var player: any;
}

export default function app(){
  global.LogPrint = (x: any) => console.log("[Purple]: ", x);
  global.addEventListener("message", (e: any) => {
    global.onEventMessage(e);
  });

  const player = new Player();

  global.realFetch = global.fetch
  global.player = player;

  player.inflateFetch();
  global.LogPrint("Script running");
}
app();
