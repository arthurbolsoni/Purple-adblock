(function () {
  let twitchMainWorker;
  let extension;

  //receive the settings from extension
  window.addEventListener("message", (event) => {
    //pass settings to worker
    if (event.data.type && event.data.type == "setInit") {
      extension = event.data.value;
    }
  })

  window.postMessage({
    type: "init",
    value: null,
  });

  window.Worker = class WorkerInjector extends Worker {
    constructor(twitchBlobUrl) {
      console.log("new worker intance " + twitchBlobUrl)

      if (twitchBlobUrl == ''){
        super(twitchBlobUrl)
      }
      if (twitchMainWorker) {
        super(twitchBlobUrl);
      }

      console.log("[Purple]: init " + twitchBlobUrl)
      
      const newBlobStr = `
      importScripts('${extension}/bundle.js');
      importScripts('${twitchBlobUrl}');
      `;

      if (!extension) {
        newBlobStr = twitchBlobUrl;
        console.log("[Purple]: Wrong return, shut down script " + twitchBlobUrl)
      }

      super(URL.createObjectURL(new Blob([newBlobStr])));
      twitchMainWorker = this;

      this.addEventListener("message", (event) => {
        if (event.data.type && event.data.type == "init") {
          window.postMessage({
            type: "getSetting",
            value: null,
          });
        }

        //receive the message from worker for stop and play the player
        if (event.data.type && event.data.type == "reload") {
          videoPlayer();
          return;
          if (window.videoPlayer.isLiveLowLatency() && window.videoPlayer.getLiveLatency() > 5) {
            window.videoPlayer.pause();
            window.videoPlayer.play();
          } else if (window.videoPlayer.getLiveLatency() > 15) {
            window.videoPlayer.pause();
            window.videoPlayer.play();
          }
        }

        //send the quality of the player to worker
        if (event.data.type && event.data.type == "getQuality") {
          videoPlayer();
          this.postMessage({
            type: "setQuality",
            value: window.videoPlayer.getQuality(),
          });
        }
      });

      //receive
      window.addEventListener("message", (event) => {
        if (event.data.type && event.data.type == "setSetting") {
          //send settings to worker
          this.postMessage({
            type: "setSetting",
            value: event.data.value,
          });
        }
      });
    }
  };

  function videoPlayer() {
    try {
      var videoController = null;
      var videoPlayer = null;

      function findReactNode(root, constraint) {
        if (root.stateNode && constraint(root.stateNode)) {
          return root.stateNode;
        }
        let node = root.child;
        while (node) {
          const result = findReactNode(node, constraint);
          if (result) {
            return result;
          }
          node = node.sibling;
        }
        return null;
      }

      var reactRootNode = null;
      var rootNode = document.querySelector("#root");
      if (
        rootNode &&
        rootNode._reactRootContainer &&
        rootNode._reactRootContainer._internalRoot &&
        rootNode._reactRootContainer._internalRoot.current
      ) {
        reactRootNode = rootNode._reactRootContainer._internalRoot.current;
      }
      videoPlayer = findReactNode(reactRootNode, (node) => node.setPlayerActive && node.props && node.props.mediaPlayerInstance);
      videoPlayer =
        videoPlayer && videoPlayer.props && videoPlayer.props.mediaPlayerInstance ? videoPlayer.props.mediaPlayerInstance : null;

      window.videoPlayer = videoPlayer;
    } catch (e) {
      console.log(e);
    }
  }
})();
