const path = require('path')
const webpack = require('webpack')

let config = require('./webpack.prod.config.js')

config.mode = 'development'
config.entry = ['react-hot-loader/patch', /*path.resolve(__dirname,'tests', 'fixtures.ts'),*/ ...config.entry, ]
config.plugins.push(new webpack.HotModuleReplacementPlugin())

module.exports = config;