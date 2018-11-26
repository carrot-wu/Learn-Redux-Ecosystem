const path = require('path')
const baseWebpackConfig = require('./webpack.base.config')
const webpackMerge = require('webpack-merge')
const nodeExternals = require("webpack-node-externals");
const clientWebpackConfig = {
  target: 'node',
  entry:path.resolve(__dirname,'../server/index.js'),
  externals:[nodeExternals()],
  output:{
    filename: 'server-bundle.js',
    path: path.resolve(__dirname, '../public'),
  },
}
module.exports = webpackMerge(baseWebpackConfig,clientWebpackConfig)
