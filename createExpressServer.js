import express from 'express'
import renderToStreamForFaas from 'ykfe-utils/es/renderToStreamForFass'

const ssrConfig = require('./config/config.ssr')
const isDev = process.env.local

const createServer = () => {
  const server = express()
  if (isDev) {
    const proxy = require('express-http-proxy')
    // 为了docker可以使用宿主机的服务，这里需要使用本机IP地址
    server.use('*', proxy(`http://host.docker.internal:8888`, {
      filter: function (req, res) {
        return /(\/static)|(\/sockjs-node)|hot-update/.test(req.baseUrl)
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
      try {
        const stream = await renderToStreamForFaas(ctx, ssrConfig)
        res.status(200)
          .set('Content-Type', 'text/html')
        res.write('<!DOCTYPE html>')
        stream.pipe(res, { end: 'false' })
        stream.on('end', () => {
          res.end()
        })
      } catch (error) {
        console.log(`renderStream Error ${error}`)
      }
    })
  })
  server.use(express.static('dist'))

  return server
}

export const server = createServer()
