
const { Server } = require('@webserverless/fc-express')
const { server } = require('./createExpressServer')
const getRawBody = require('raw-body')
const proxyServer = new Server(server)
// const { csr } = require('yk-cli/bin/clientRender')
exports.initializer = (context, callback) => {
  // console.log('clientRender invoked')
  // csr()
  callback(null, '')
}
// http trigger
exports.handler = async (req, res, context) => {
  req.body = await getRawBody(req)
  proxyServer.httpProxy(req, res, context)
}
