/* eslint-disable linebreak-style */

import { ChannelService } from "./channel/channelService";
import { fetchService } from "./fetch/fetchService";
import { HLS } from "./HLS";
import { _construct } from "./_construct";

let twitchMainWorker: any;
window.Worker = class WorkerInjector extends Worker {
  constructor(twitchBlobUrl: string | URL) {
    if (twitchMainWorker) {
      super(twitchBlobUrl);
    }

    const newBlobStr = `
                ${fetchService.toString()};
                ${ChannelService.toString()};
                ${_construct.toString()};
                ${HLS.toString()}
                declare(self, "${whitelist}");
                fetchService();
                importScripts('${twitchBlobUrl}');
                `;

    super(URL.createObjectURL(new Blob([newBlobStr])));
    twitchMainWorker = this;
    //this.addEventListener('message', function (e) {console.log(e.data)});
  }
};