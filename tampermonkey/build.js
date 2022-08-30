const fs = require('fs');

console.log("building userScript version: " + process.env.npm_package_version);

let raw = fs.readFileSync('./purpleServiceWorker/dist/bundle.js');

const build = `// ==UserScript==
// @name         Purple Adblocker
// @namespace    https://github.com/arthurbolsoni
// @version      ${process.env.npm_package_version}
// @description  Per aspera ad astra
// @author       ArthurBolzoni
// @match        https://raw.githubusercontent.com/arthurbolsoni/Purple-adblock/main/chrome/app/bundle.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=githubusercontent.com
// @match        *://*.twitch.tv/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

${raw}`

if (!fs.existsSync('tampermonkey/dist')) fs.mkdirSync('tampermonkey/dist');

fs.writeFileSync('tampermonkey/dist/purpleadblocker.user.js', build);