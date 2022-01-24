/* eslint-disable linebreak-style */

import { App } from "./app.service";
import { ChannelService } from "./channel/channel.service";
import { fetchService } from "./fetch/fetch.service";
import { HLS } from "./HLS";

let twitchMainWorker: any;
window.Worker = class WorkerInjector extends Worker {
  constructor(twitchBlobUrl: string | URL) {
    if (twitchMainWorker) {
      super(twitchBlobUrl);
    }

    const newBlobStr = `
                ${App.toString()};
                new App("${whitelist}");
                importScripts('${twitchBlobUrl}');
                `;

    super(URL.createObjectURL(new Blob([newBlobStr])));
    twitchMainWorker = this;
    //this.addEventListener('message', function (e) {console.log(e.data)});
  }
};