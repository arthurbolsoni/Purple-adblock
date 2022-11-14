const fs = require("fs");
var fs_Extra = require("fs-extra");
const archiver = require("archiver");

platform = "chromium";
fileType = ".zip";
const dirname = "./dist";
const name = process.env.npm_package_name + "-" + process.env.npm_package_version + "-" + platform;

console.log("===================================================================");
console.log("Building " + platform + " extension version: " + process.env.npm_package_version);
console.log("===================================================================");

//manifest build
const manifest = JSON.parse(fs.readFileSync("./platform/" + platform + "/manifest.json"));
manifest.version = process.env.npm_package_version;

if (!fs.existsSync(dirname)) fs.mkdirSync(dirname);

//if production zip the content,
if (process.env.NODE_ENV === "development") {
  if (!fs.existsSync(dirname + "/" + name)) fs.mkdirSync(dirname + "/" + name);
  fs_Extra.copySync("./platform/src/", dirname + "/" + name);
  fs_Extra.copySync("./platform/" + platform, dirname + "/" + name);
  fs.copyFileSync("./serviceWorker/dist/bundle.js", dirname + "/" + name + "/app/bundle.js");
  fs.writeFileSync(dirname + "/" + name + "/" + "manifest.json", JSON.stringify(manifest));

  console.log("Build packed to " + dirname + "/" + name);
} else {
  const zipFile = archiver("zip", { zlib: { level: 9 } });
  zipFile.pipe(fs.createWriteStream(dirname + "/" + name + fileType));
  zipFile.directory("./platform/src", false);
  zipFile.file("./serviceWorker/dist/bundle.js", { name: "app/bundle.js" });
  zipFile.append(Buffer.from(JSON.stringify(manifest)), { name: "manifest.json" });
  zipFile.finalize();

  console.log("Build packed to " + dirname + "/" + name + fileType);
}
