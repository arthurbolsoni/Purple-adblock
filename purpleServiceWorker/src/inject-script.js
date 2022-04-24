(function () {
  let twitchMainWorker;

  window.Worker = class WorkerInjector extends Worker {
    constructor(twitchBlobUrl) {

      window.postMessage({
        type: "init",
        value: null,
      });

      if (twitchMainWorker) {
        super(twitchBlobUrl);
      }
      
        const newBlobStr = `
        importScripts('chrome-extension://bgbcmmagfjhgnendhjapjpfbljbmlmoe/app/bundle.js');
        importScripts('${twitchBlobUrl}');
        `;

      super(URL.createObjectURL(new Blob([newBlobStr])));
      twitchMainWorker = this;

      //worker
      this.addEventListener("message", (event) => {
        if (event.data.type && event.data.type == "init") {
          window.postMessage({
            type: "getWhitelist",
            value: null,
          });
        }

        //receive the message from worker for stop and play the player
        if (event.data.type && event.data.type == "reload") {
          videoPlayer();
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
        //pass settings to worker
        if (event.data.type && event.data.type == "setInit") {
          //console.log(event.data.value);
        }
        
        if (event.data.type && event.data.type == "setWhitelist") {
          //send whitelist to worker
          this.postMessage({
            type: "setWhitelist",
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
