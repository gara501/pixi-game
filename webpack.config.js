const path = require("path");

module.exports = {
  entry: ["./app/index.js"],
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "bundle.js"
  },
  devtool: "sourcemap",
  module: {
    rules: [
      {
        test: /\.json$/,
        loader: "json-loader"
      }
    ]
  },
  devServer: {
    port: 3001,
    contentBase: "./build",
    inline: true
  }
};
