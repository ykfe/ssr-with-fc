const { Server } = require('@webserverless/fc-express')
const getRawBody = require('raw-body')
const { server } = require('./createExpressServer')
const proxyServer = new Server(server)

// http trigger
module.exports.handler = async (req, res, context) => {
  req.body = await getRawBody(req)
  proxyServer.httpProxy(req, res, context)
}
