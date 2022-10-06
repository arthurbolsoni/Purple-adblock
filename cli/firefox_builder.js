const fs = require("fs");
const archiver = require("archiver");

console.log("===================================================================");
console.log("Building Firefox extension version: " + process.env.npm_package_version);
console.log("===================================================================");

var raw = fs.readFileSync("./platform/firefox/manifest.json");
raw = JSON.parse(raw);
raw.version = process.env.npm_package_version;
raw.description = process.env.npm_package_description;

fs.writeFileSync("./platform/firefox/manifest.json", JSON.stringify(raw));
fs.copyFileSync("./serviceWorker/dist/bundle.js", "./platform/firefox/app/bundle.js");

var dirname = "./build";
const fileName = process.env.npm_package_name + "-" + process.env.npm_package_version + "-firefox";

if (!fs.existsSync(dirname)) fs.mkdirSync(dirname);

const writeStream1 = fs.createWriteStream(dirname + "/" + fileName + ".zip");
const zipFile1 = archiver("zip", { zlib: { level: 9 } });
zipFile1.pipe(writeStream1);
zipFile1.directory("./platform/firefox", false);
zipFile1.finalize();

console.log("===================================================================");
console.log("Build packed to " + dirname + "/" + fileName + ".zip");
console.log("===================================================================");