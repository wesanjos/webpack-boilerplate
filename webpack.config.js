const webpack = require("webpack");
const path = require("path");
const { globSync } = require("glob");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const RemoveEmptyScriptsPlugin = require("webpack-remove-empty-scripts");
const postcssCustomProperties = require("postcss-custom-properties");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const WebpackBar = require("webpackbar");

const jsEntries = globSync("./src/scripts/pages/*.js").reduce(
  (entries, file) => {
    const name = path.basename(file, ".js");
    entries[`js/${name}`] = file;
    return entries;
  },
  {}
);

const stylusEntries = globSync("./src/stylus/pages/*.styl").reduce(
  (entries, file) => {
    const name = path.basename(file, ".styl");
    entries[`style/${name}`] = file; // Adiciona '-style' apenas para o processador interno do Webpack
    return entries;
  },
  {}
);

module.exports = {
  entry: {
    ...jsEntries,
    ...stylusEntries,
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].min.js",
    clean: true,
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: path.resolve(__dirname, "node_modules"),
        use: "babel-loader",
      },
      {
        test: /\.styl$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { sourceMap: false, importLoaders: 1, url: false },
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
              postcssOptions: {
                plugins: [postcssCustomProperties()],
              },
            },
          },
          {
            loader: "stylus-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(?:ico|png|svg|jpg|gif|webp)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "images/[name].[ext]", // Diretório e formato do nome de saída
          },
        },
      },
    ],
  },
  plugins: [
    new WebpackBar(),
    new CopyPlugin({
      patterns: [
        {
          from: "src/images",
          to: "images",
          noErrorOnMissing: true,
        },
      ],
    }),
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jquery: "jquery",
    }),
  ],
  resolve: {
    modules: ["node_modules"],
    extensions: [".js", ".styl"],
    preferRelative: true,
  },
  cache: true,
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
