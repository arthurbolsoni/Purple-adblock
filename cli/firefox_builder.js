const fs = require('fs');
var fs_Extra = require('fs-extra');
const archiver = require('archiver');

platform = "firefox";
fileType = ".xpi";
const dirname = "./dist";
const name = process.env.npm_package_name + "-" + process.env.npm_package_version + "-unsigned-" + platform;

console.log("===================================================================");
console.log("Building " + platform + " extension version: " + process.env.npm_package_version);
console.log("===================================================================");

//manifest build
const manifest = JSON.parse(fs.readFileSync("./platform/" + platform + "/manifest.json"))
manifest.version = process.env.npm_package_version;
manifest.description = process.env.npm_package_description;

//copy the bundle.js
fs.copyFileSync("./serviceWorker/dist/bundle.js", "./platform/src/app/bundle.js");

if (!fs.existsSync(dirname)) fs.mkdirSync(dirname);

//if production zip the content,
if (process.env.NODE_ENV === "development") {
    if (!fs.existsSync(dirname + "/" + name)) fs.mkdirSync(dirname + "/" + name);
    fs_Extra.copySync("./platform/src/", dirname + "/" + name);
    fs_Extra.copySync("./platform/" + platform, dirname + "/" + name);
    fs.writeFileSync(dirname + "/" + name + "/" + "manifest.json", JSON.stringify(manifest));

    console.log("Build packed to " + dirname + "/" + name);
} else {
    const zipFile = archiver("zip", { zlib: { level: 9 } });
    zipFile.pipe(fs.createWriteStream(dirname + "/" + name + fileType));
    zipFile.directory("./platform/src", false);
    zipFile.directory("./platform/" + platform, false);
    zipFile.append(Buffer.from(JSON.stringify(manifest)), { name: "./platform/manifest.json" });
    zipFile.finalize();

    console.log("Build packed to " + dirname + "/" + name + fileType);
}
