export function _construct(scope: any, whitelist: any[]) {
  scope.LogPrint = (x: any) => {
    console.log("[Purple]: ", x);
  };
  scope.realFetch = fetch;
  scope.quality = "";
  scope.addEventListener("message", function (e) {
    switch (e.data.funcName) {
      case "setQuality": {
        scope.quality = e.data.args[0].name;
        break;
      }
      default: {
        break;
      }
    }
  });

  scope.channel = [];
  scope.actualChannel = "";
  scope.whitelist = whitelist;
}