const path = require("path");

module.exports = {
  entry: "./src/app.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  optimization: {
    //if you have that portion uncomment Webpack 5 splits chunks without having dublicates
    //but the app isn't working
    splitChunks: {
      chunks: "all",
      minSize: 0,
    },
    //If we comment out splitChunks portion
    //app would work ok but we would have dublication of chat-module in main.js and chat.js

    // concatenateModules: true,
    // usedExports: true, //To opt-out from used exports analysis per runtime: usedExports: 'global'
    // providedExports: true,
    // chunkIds: "deterministic" // To keep filename consistent between different modes (for example building only)
  },
};
