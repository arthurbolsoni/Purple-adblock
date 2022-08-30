const fs = require('fs');

console.log("building Chromium extension version: " + process.env.npm_package_version);

var raw = fs.readFileSync('./chrome/manifest.json')
raw = JSON.parse(raw);
raw.version = process.env.npm_package_version;
raw.description = process.env.npm_package_description;

fs.writeFileSync('./chrome/manifest.json', JSON.stringify(raw));