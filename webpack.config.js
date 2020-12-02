const path = require('path');
const webpack = require('webpack')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const AddAssetHtmlPlugin = require("add-asset-html-webpack-plugin");

const buildPath = path.resolve(__dirname, 'public')

let config = {
    mode: 'development',
    devtool: "source-map",
    entry: {
        app: {import: './src/index.tsx',  filename: 'assets/javascript/app.js'}
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: [
                    { loader: 'ts-loader', options: { onlyCompileBundledFiles: true } }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['*', '.ts', '.tsx', '.js'],
        alias: {}
    },
    output: {
        path: buildPath,
        publicPath: '/'
    },
    plugins: [
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require("./vendor-build/vendor-manifest.json"),
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src/index.html'),
            hash: true
        }),
        new AddAssetHtmlPlugin({
          filepath: path.resolve(__dirname, 'vendor-build/vendor.js'),
          outputPath: 'assets/javascript/',
          publicPath: '/assets/javascript/',
          includeRelatedFiles: true,
          hash: true
        }),        
    ],
};

module.exports = config;