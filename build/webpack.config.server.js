
const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const baseConfig = require('./webpack.config.base')
const paths = require('./paths')
const isDev = process.env.NODE_ENV === 'development'
const plugins = [
  new webpack.DefinePlugin({
    '__isBrowser__': false //eslint-disable-line
  })
]

if (process.env.npm_config_report === 'true') {
  plugins.push(new BundleAnalyzerPlugin())
}

module.exports = merge(baseConfig, {
  devtool: isDev ? 'eval-source-map' : '',
  entry: {
    FC: paths.fc,
    Layout: path.resolve(__dirname, '../web/layout')
  },
  module: {
    rules: [
      {
        test: /\.(css|sass|less|scss)$/,
        use: ['ignore-loader']
      }
    ]
  },
  stats: {
    modules: true,
    warnings: false
  },
  node: {
    __dirname: true
  },
  target: 'node',
  output: {
    path: paths.appBuild,
    publicPath: '/',
    filename: '[name].server.js',
    libraryTarget: 'commonjs2'
  },
  plugins: plugins
})
