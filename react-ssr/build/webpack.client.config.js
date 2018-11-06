const path = require('path')
const baseWebpackConfig = require('./webpack.base.config')
const webpackMerge = require('webpack-merge')
const htmlPlugin = require('html-webpack-plugin')

const clientWebpackConfig = {
  target: 'browser',
  entry:path.resolve(__dirname,'../src/index.js'),
  output:{
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, '../public'),
  },
  plugins:[
    new htmlPlugin({
      template: path.resolve(__dirname, '../src/template.html'),
      filename: `./public/index.html`,
    }),
  ]
}
module.exports = webpackMerge(baseWebpackConfig,clientWebpackConfig)
