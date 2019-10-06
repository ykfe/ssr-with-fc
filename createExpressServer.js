const express = require('express')
const { renderToStream } = require('ykfe-utils')
const ssrConfig = require('./config/config.ssr')
const createServer = () => {
  const server = express()
  server.get('/', async (req, res) => {
    const ctx = {
      req,
      res,
      path: req.path,
      app: {
        config: ssrConfig
      }
    }
    const stream = await renderToStream(ctx, ssrConfig)
    res.set('Content-Type', 'text/html')
    stream.pipe(res, { end: 'false' })
    stream.on('end', () => {
      res.status(200)
      res.end()
    })
  })
  server.use(express.static('dist'))

  return server
}

const server = createServer()

exports.server = server
