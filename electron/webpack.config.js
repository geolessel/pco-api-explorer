var webpack = require("webpack")
module.exports = {
  entry: {
    app: ["webpack/hot/dev-server", "./js/entry.js"]
  },
  output: {
    // path: "./public/built",
    filename: "bundle.js",
    publicPath: "/"
  },
  devServer: {
    contentBase: "./public",
    publicPath: "http://localhost:8080/built/"
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query: {
          presets: ["react", "es2015"],
          plugins: ["transform-object-rest-spread"]
        }
      },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.less$/, loader: "style-loader!css-loader!less-loader" }
    ]
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  node: { fs: "empty" }
}
