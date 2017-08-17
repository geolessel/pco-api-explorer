const path = require("path")
const webpack = require("webpack")

module.exports = {
  entry: {
    app: ["webpack/hot/dev-server", "./js/entry.js"]
  },
  output: {
    // path: "./public/built",
    filename: "bundle.js",
    publicPath: "http://localhost:8080/built/"
  },
  devServer: {
    contentBase: "./public",
    publicPath: "http://localhost:8080/built/"
  },
  resolve: {
    modules: ["../electron/node_modules"]
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query: {
          presets: [
            require.resolve("babel-preset-react"),
            require.resolve("babel-preset-es2015")
          ],
          plugins: [
            require.resolve("babel-plugin-transform-object-rest-spread")
          ]
        }
      },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.less$/, loader: "style-loader!css-loader!less-loader" }
    ]
  },
  plugins: [new webpack.HotModuleReplacementPlugin()]
}
