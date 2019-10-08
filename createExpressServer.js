const express = require('express')
const { renderToStream } = require('ykfe-utils')
const ssrConfig = require('./config/config.ssr')
const isDev = process.env.local

const createServer = () => {
  const server = express()
  if (isDev) {
    const proxy = require('express-http-proxy')
    // 为了docker可以使用宿主机的服务，这里需要使用本机IP地址
    server.use('*', proxy(`http://host.docker.internal:8888`, {
      filter: function (req, res) {
        return /(\/static)|(\/sockjs-node)|(\/__webpack_dev_server__)|hot-update/.test(req.baseUrl)
      },
      proxyReqPathResolver: function (req) {
        return '/2016-08-15/proxy/ssr/page' + req.baseUrl
      }
    }))
  }
  ssrConfig.routes.map(item => {
    server.get(item.path, async (req, res) => {
      const ctx = {
        req,
        res,
        path: req.path,
        app: {
          config: ssrConfig
        }
      }
      const stream = await renderToStream(ctx, ssrConfig)
      res.status(200)
        .set('Content-Type', 'text/html')
      stream.pipe(res, { end: 'false' })
      stream.on('end', () => {
        res.end()
      })
    })
  })
  server.use(express.static('dist'))

  return server
}

const server = createServer()

exports.server = server
