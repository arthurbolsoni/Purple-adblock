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
fs.copyFileSync("./serviceWorker/dist/bundle.js", "./platform/src/app/bundle.js");

var dirname = "./dist/";
const fileName = process.env.npm_package_name + "-" + process.env.npm_package_version + "-chrome";

if (!fs.existsSync(dirname)) fs.mkdirSync(dirname);

const writeStream1 = fs.createWriteStream(dirname + "/" + fileName + ".zip");
const zipFile1 = archiver("zip", { zlib: { level: 9 } });
zipFile1.pipe(writeStream1);
zipFile1.directory("./platform/src", false);
zipFile1.directory("./platform/chrome", false);
zipFile1.finalize();

console.log("===================================================================");
console.log("Build packed to " + dirname + "/" + fileName + ".zip");
console.log("===================================================================");