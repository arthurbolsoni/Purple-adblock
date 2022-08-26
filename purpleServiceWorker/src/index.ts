//this line gonna import the content from compile worker as string
//@ts-expect-error
import txt from "../dist/app.worker.js";

(function () {
  let mainWorker: any;

  window.postMessage({ type: "init" });

  window.Worker = class WorkerInjector extends Worker {
    constructor(twitchBlobUrl: any) {
      console.log("new worker intance " + twitchBlobUrl)

      if (twitchBlobUrl == '') super(twitchBlobUrl)
      console.log("[Purple]: init " + twitchBlobUrl)

      const newBlobStr = `${txt}
      importScripts('${twitchBlobUrl}');`;

      super(URL.createObjectURL(new Blob([newBlobStr], { type: "text/javascript" })));
      mainWorker = this;
      mainWorker.declareEventWorker();
      mainWorker.declareEventWindow();
    }

    declareEventWorker() {
      this.addEventListener("message", (event) => {
        // if (typeof (event.data.type) === "string") console.log(event.data);

        switch (event.data.type) {
          case "init": {
            window.postMessage({ type: "getSetting", value: null, });
            break;
          }
          case "PlayerQualityChanged": {
            if (event.data.type == "PlayerQualityChanged") console.log("Changed quality by player: " + event.data.arg.name);
            break;
          }
          case "pause": {
            mainWorker.postMessage({ funcName: "pause", args: undefined, id: 1 });
            break;
          }
          default: {
            break;
          }
        }
      })
    }

    declareEventWindow() {
      //Event listener from window and extension.
      window.addEventListener("message", (event) => {
        switch (event.data.type) {
          case "setSetting": {
            //send settings to worker
            mainWorker.postMessage({ funcName: "setSetting", value: event.data.value });
          }
        }
      });
    }
  };

  // function videoPlayer() {
  //   try {
  //     var videoController = null;
  //     var videoPlayer = null;

  //     function findReactNode(root, constraint) {
  //       if (root.stateNode && constraint(root.stateNode)) {
  //         return root.stateNode;
  //       }
  //       let node = root.child;
  //       while (node) {
  //         const result = findReactNode(node, constraint);
  //         if (result) {
  //           return result;
  //         }
  //         node = node.sibling;
  //       }
  //       return null;
  //     }

  //     var reactRootNode = null;
  //     var rootNode = document.querySelector("#root");
  //     if (
  //       rootNode &&
  //       rootNode._reactRootContainer &&
  //       rootNode._reactRootContainer._internalRoot &&
  //       rootNode._reactRootContainer._internalRoot.current
  //     ) {
  //       reactRootNode = rootNode._reactRootContainer._internalRoot.current;
  //     }
  //     videoPlayer = findReactNode(reactRootNode, (node) => node.setPlayerActive && node.props && node.props.mediaPlayerInstance);
  //     videoPlayer =
  //       videoPlayer && videoPlayer.props && videoPlayer.props.mediaPlayerInstance ? videoPlayer.props.mediaPlayerInstance : null;

  //     window.videoPlayer = videoPlayer;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
})();
