const fs = require("fs");
const archiver = require("archiver");

console.log("===================================================================");
console.log("Building Chromium extension version: " + process.env.npm_package_version);
console.log("===================================================================");

var raw = fs.readFileSync("./platform/chrome/manifest.json");
raw = JSON.parse(raw);
raw.version = process.env.npm_package_version;
raw.description = process.env.npm_package_description;

fs.writeFileSync("./platform/chrome/manifest.json", JSON.stringify(raw));
fs.copyFileSync("./serviceWorker/dist/bundle.js", "./platform/chrome/app/bundle.js");

const dirname = "./build";
const fileName = process.env.npm_package_name + "-" + process.env.npm_package_version + "-chrome";

if (!fs.existsSync(dirname)) fs.mkdirSync(dirname);

const writeStream = fs.createWriteStream(dirname + "/" + fileName + ".zip");
const zipFile = archiver("zip", { zlib: { level: 9 } });
zipFile.pipe(writeStream);
zipFile.directory("./platform/chrome", false);
zipFile.finalize();

console.log("===================================================================");
console.log("Build packed to " + dirname + "/" + fileName + ".zip");
console.log("===================================================================");
