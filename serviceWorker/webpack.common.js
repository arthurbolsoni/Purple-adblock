const path = require("path");

module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.worker\.js$/,
        type: "asset/source",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};
