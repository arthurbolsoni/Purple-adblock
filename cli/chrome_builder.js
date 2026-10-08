const fs = require("fs");
var fs_Extra = require("fs-extra");
const archiver = require("archiver");
import { isPackaged, unpackedName, zipName } from "./files.js";

// `out`: the dist folder; `bundle`: the worker bundle. Resolves once the build is written (the zip stream closed).
export function buildChrome(dev, { out = "./dist", bundle = "./serviceWorker/dist/bundle.js" } = {}) {
  const platform = "chromium";
  const dirname = out;
  const version = require("../package.json").version;
  const name = dev ? unpackedName(platform) : zipName(platform, version);

  console.log("===================================================================");
  console.log("Building " + platform + " extension version: " + version);
  console.log("===================================================================");

  //manifest build
  const manifest = JSON.parse(fs.readFileSync("./platform/" + platform + "/manifest.json"));
  manifest.version = version;

  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

  //if production zip the content,
  if (dev) {
    if (!fs.existsSync(dirname + "/" + name)) fs.mkdirSync(dirname + "/" + name);
    fs_Extra.copySync("./platform/src/", dirname + "/" + name, { filter: isPackaged });
    fs_Extra.copySync("./platform/" + platform, dirname + "/" + name);
    fs.copyFileSync(bundle, dirname + "/" + name + "/app/bundle.js");
    fs.writeFileSync(dirname + "/" + name + "/" + "manifest.json", JSON.stringify(manifest));

    console.log("Build packed to " + dirname + "/" + name);
    return Promise.resolve();
  }

  const zipFile = archiver("zip", { zlib: { level: 9 } });
  const written = new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(dirname + "/" + name);
    stream.on("close", resolve);
    stream.on("error", reject);
    zipFile.on("error", reject);
    zipFile.pipe(stream);
  });
  zipFile.directory("./platform/src", false, (entry) => (isPackaged(entry.name) ? entry : false));
  zipFile.file(bundle, { name: "app/bundle.js" });
  zipFile.append(Buffer.from(JSON.stringify(manifest)), { name: "manifest.json" });
  zipFile.finalize();

  console.log("Build packed to " + dirname + "/" + name);
  return written;
}
