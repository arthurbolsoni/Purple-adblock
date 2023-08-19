const fs = require("fs");

console.log("building userScript version: " + process.env.npm_package_version);

let raw = fs.readFileSync("./serviceWorker/dist/bundle.js");

const build = `// ==UserScript==
// @name         Purple Adblocker
// @source       https://github.com/arthurbolsoni/Purple-adblock
// @version      ${process.env.npm_package_version}
// @description  Per aspera ad astra
// @author       ArthurBolzoni
// @downloadURL  https://raw.githubusercontent.com/arthurbolsoni/Purple-adblock/main/platform/tampermonkey/dist/purpleadblocker.user.js
// @updateURL    https://raw.githubusercontent.com/arthurbolsoni/Purple-adblock/main/platform/tampermonkey/dist/purpleadblocker.user.js
// @match        *://*.twitch.tv/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

${raw}`;

if (!fs.existsSync("platform/tampermonkey/dist")) fs.mkdirSync("platform/tampermonkey/dist");

fs.writeFileSync("platform/tampermonkey/dist/purpleadblocker.user.js", build);
