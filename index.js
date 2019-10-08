
const { Server } = require('@webserverless/fc-express')
const { server } = require('./createExpressServer')
const getRawBody = require('raw-body')
const proxyServer = new Server(server)

// http trigger
exports.handler = async (req, res, context) => {
  req.body = await getRawBody(req)
  proxyServer.httpProxy(req, res, context)
}
