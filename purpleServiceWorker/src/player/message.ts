export class PlayerMessage {
    getQuality = global.postMessage({ type: "getQuality" });
    init = global.postMessage({ type: "init" });

    pause = global.postMessage({ type: "pause"});

    quality: string = "";
    setting: any = {}

    listener() {
        global.onEventMessage = (e: any) => {
            // var myMessage = new MessageEvent('worker', { data: 'hello' });

            // if (global.onmessage) global.onmessage(this, myMessage);

            switch (e.data.funcName) {
                case "pause": {
                    break;
                }
                case "setQuality": {
                    if (!e.data.args) break;
                    this.quality = e.data.args[0].name;
                    break;
                }
                case "setSetting": {
                    this.setting = e.data.value;
                    break;
                }
                default: {
                    break;
                }
            }
        }
    }
}