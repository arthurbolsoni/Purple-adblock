import fs from "fs";
import archiver from "archiver";
import { signAddon } from 'sign-addon';
import dotenv from "dotenv"

dotenv.config()
console.log("Signing package .xpi with AMO")

var dirname = "./dist";
const fileName = process.env.npm_package_name + "-" + process.env.npm_package_version + "-unsigned-firefox";

signAddon({
    // Required arguments:

    xpiPath: dirname + "/" + fileName + ".xpi",
    version: process.env.npm_package_version,
    apiKey: process.env.AMO_API_KEY,
    apiSecret: process.env.AMO_API_SECRET,
    id: "{a7399979-5203-4489-9861-b168187b52e1}",
    channel: "unlisted",
    downloadDir: "./dist/",
})
    .then(function (result) {
        if (result.success) {
            console.log('The following signed files were downloaded:');
            console.log(result.downloadedFiles);
            console.log('Your extension ID is:');
            console.log(result.id);
        } else {
            console.error('Your add-on could not be signed!');
            console.error('Error code: ' + result.errorCode);
            console.error('Details: ' + result.errorDetails);
        }
        console.log(result.success ? 'SUCCESS' : 'FAIL');
    })
    .catch(function (error) {
        console.error('Signing error:', error);
    });