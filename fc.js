import { Server } from '@webserverless/fc-express'
import getRawBody from 'raw-body'
import { server } from './createExpressServer'
const proxyServer = new Server(server)

// http trigger
export const handler = async (req, res, context) => {
  req.body = await getRawBody(req)
  proxyServer.httpProxy(req, res, context)
}
