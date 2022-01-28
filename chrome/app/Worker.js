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
    //this.addEventListener('message', function (e) {console.log(e.data)});
  }
}})();