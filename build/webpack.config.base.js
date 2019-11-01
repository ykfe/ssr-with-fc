
'use strict'

const paths = require('./paths')
const path = require('path')
// style files regexes
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const webpackModule = {
  strictExportPresence: true,
  rules: [
    { parser: { requireEnsure: false } },
    {
      oneOf: [
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          loader: require.resolve('url-loader'),
          options: {
            limit: 10000,
            name: 'static/media/[name].[hash:8].[ext]'
          }
        },
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: true,
            cacheCompression: false,
            presets: [
              [
                '@babel/preset-env',
                {
                  modules: false,
                  loose: true
                }
              ],
              '@babel/preset-react'
            ]
          }
        }
      ]
    }
  ]
}

module.exports = {
  stats: {
    children: false,
    entrypoints: false
  },
  mode: process.env.NODE_ENV,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../web')
    },
    extensions: paths.moduleFileExtensions
      .map(ext => `.${ext}`)
  },
  module: webpackModule,
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].css',
      chunkFilename: 'static/css/[name].chunk.css'
    })
  ],
  performance: false
}
