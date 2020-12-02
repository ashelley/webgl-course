const webpack = require("webpack");
const path = require("path");

module.exports = {
  context: __dirname,
  entry: {
    vendor: path.resolve(__dirname, "vendor", "vendor-config.js")
  },
  devtool: "source-map",
  mode: "development",
  output: {
    path: path.resolve(__dirname, "vendor-build"),
    filename: "[name].js",
    library: "[name]",
  },
  plugins: [
    new webpack.DllPlugin({  
      path: path.resolve(__dirname, "vendor-build", "[name]-manifest.json"),
      name: "[name]",
      entryOnly: false
    })
  ]
};