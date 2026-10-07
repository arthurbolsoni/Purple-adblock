const fs = require("fs");
const path = require("path");

// optional output path: the e2e build writes to dist/ (docs/tests.md, "Browser setup")
const out = process.argv[2] || "platform/tampermonkey/dist/purpleadblocker.user.js";

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

fs.mkdirSync(path.dirname(out), { recursive: true });

fs.writeFileSync(out, build);
