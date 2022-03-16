(function () {
  let twitchMainWorker;
  window.Worker = class WorkerInjector extends Worker {
    constructor(twitchBlobUrl) {
      if (twitchMainWorker) {
        super(twitchBlobUrl);
      }

      const newBlobStr = `
      importScripts('chrome-extension://bgbcmmagfjhgnendhjapjpfbljbmlmoe/app/bundle.js');
      importScripts('${twitchBlobUrl}');
      `;

      super(URL.createObjectURL(new Blob([newBlobStr])));
      twitchMainWorker = this;

      
      this.addEventListener("message", (event) => {
        if (event.data.type && (event.data.type == "getWhitelist")) {
            window.postMessage({
                type: "getWhitelist",
                value: null
            }, "*");
        }
      });
        
      window.addEventListener("message", (event) => {
        if (event.data.type && (event.data.type == "setWhitelist")) {
          //send to blob script
          this.postMessage({
            type: "setWhitelist",
            value: event.data.value
          });
        }
      });
    }
  }
})();