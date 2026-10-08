const fs = require("fs");
const path = require("path");

// optional output path: the e2e build writes to dist/ (docs/tests.md, "Browser setup"); optional worker bundle path (tests)
const out = process.argv[2] || "platform/tampermonkey/dist/purpleadblocker.user.js";
const bundle = process.argv[3] || "./serviceWorker/dist/bundle.js";
// from package.json, so a direct `bun platform/tampermonkey/build.js` gets it too (T-701)
const version = require("../../package.json").version;

console.log("building userScript version: " + version);

let raw = fs.readFileSync(bundle);

const build = `// ==UserScript==
// @name         Purple Adblocker
// @source       https://github.com/arthurbolsoni/Purple-adblock
// @version      ${version}
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
