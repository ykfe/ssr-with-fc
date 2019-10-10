
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')
const nodeExternals = require('webpack-node-externals')
const paths = require('./paths')
const isDev = process.env.NODE_ENV === 'development'

const plugins = [
  new webpack.DefinePlugin({
    '__isBrowser__': false //eslint-disable-line
  })
]
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

if (process.env.npm_config_report === 'true') {
  plugins.push(new BundleAnalyzerPlugin())
}

module.exports = merge(baseConfig, {
  devtool: isDev ? 'eval-source-map' : '',
  entry: {
    Page: paths.entry,
    FC: paths.fc
  },
  stats: {
    modules: true,
    warnings: false
  },
  target: 'node',
  // 生产环境将第三方依赖与bundle.server.js打包在一起发布到fc
  externals: false ? nodeExternals({
    whitelist: /\.(css|less|sass|scss)$/
  }) : '',
  output: {
    path: paths.appBuild,
    publicPath: '/',
    filename: '[name].server.js',
    libraryTarget: 'commonjs2'
  },
  plugins: plugins
})
