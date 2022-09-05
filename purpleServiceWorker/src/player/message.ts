export class PlayerMessage {
    getQuality = () => global.postMessage({ type: "getQuality" });
    init = () => global.postMessage({ type: "init" });
    pause = () => global.postMessage({ type: "pause" });
    play = () => global.postMessage({ type: "play" });
    pauseAndPlay = () => {
        this.pause();
        this.play();
    }

    isLoaded = false;

    quality: string = "";
    // setting: { proxyUrl: string, toggleProxy: boolean, whiteList: Array<string>};
    setting: any;

    constructor() {
        global.onEventMessage = (e: any) => {
            // var myMessage = new MessageEvent('worker', { data: 'hello' });

            // if (global.onmessage) global.onmessage(this, myMessage);

            switch (e.data.funcName) {
                case "Buffering": {
                    break;
                }
                case "onClientSinkPlaying": {
                    break;
                }
                case "onClientSinkUpdate": {
                    break;
                }
                case "pause": {
                    break;
                }
                case "play": {
                    break;
                }
                case "Ready": {
                    break;
                }
                case "Playing": {
                    break;
                }
                case "setQuality": {
                    if (e.data.args) this.quality = e.data.args[0].name;
                    if (e.data.value) this.quality = e.data.value;
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