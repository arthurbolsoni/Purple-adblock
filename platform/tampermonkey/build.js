const fs = require("fs");
const path = require("path");

// optional output path: the e2e build writes to dist/ (docs/tests.md, "Browser setup"); optional worker bundle path (tests)
const out = process.argv[2] || "platform/tampermonkey/dist/purpleadblocker.user.js";
const bundle = process.argv[3] || "./serviceWorker/dist/bundle.js";
// from package.json, so a direct `bun platform/tampermonkey/build.js` gets it too (T-701)
const version = require("../../package.json").version;

console.log("building userScript version: " + version);

let raw = fs.readFileSync(bundle);

// T-704: the userscript carries TwitchAdSolutions' code (THIRD-PARTY-NOTICES.md), so it carries its MIT notice
const NOTICE = `// Purple Adblock, https://github.com/arthurbolsoni/Purple-adblock
// Copyright 2021-present Arthur Bolsoni. Licensed under the Apache License, Version 2.0:
// https://www.apache.org/licenses/LICENSE-2.0
//
// Includes code from TwitchAdSolutions (https://github.com/pixeltris/TwitchAdSolutions and its fork
// https://github.com/ryanbr/TwitchAdSolutions) under the MIT License:
//
// Copyright (c) 2020-present TwitchAdSolutions Contributors
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
`;

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
// @license      Apache-2.0
// ==/UserScript==

${NOTICE}
${raw}`;

fs.mkdirSync(path.dirname(out), { recursive: true });

fs.writeFileSync(out, build);
