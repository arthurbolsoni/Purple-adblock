var version2 = true;

function init(whiteList) {
    var app = document.createElement('script');
    app.src = chrome.runtime.getURL('app/bundle.js');
    
    var actualCode = `var whitelist = "${ whiteList }";`;
    var script = document.createElement('script');
    script.textContent = actualCode;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
    app.remove();

    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('app/Worker.js');
    s.onload = function () {
        this.remove();
    };

    (document.head || document.documentElement).appendChild(s);
}

chrome.storage.local.get(["whiteList", "settings"], function (items) {
    if (items.whiteList !== undefined) {
        whiteList = items.whiteList;
    }

    if (items.settings !== undefined) {
        settings = items.settings;
        version2 = settings[1];
        if (version2) {
            init(items.whiteList);
        }
    }
});