const resolvePath = (path) => require('path').resolve(__dirname, path)
const isDev = (process.env.NODE_ENV === 'development') || process.env.local
// const staticPrefix = isDev ? 'http://localhost:8888/2016-08-15/proxy/ssr/page' : '' // 静态资源路径前缀
const staticPrefix = '/2016-08-15/proxy/ssr/page' // 静态资源路径前缀

module.exports = {
  type: 'ssr', // 指定运行类型可设置为csr切换为客户端渲染
  prefix: '/2016-08-15/proxy/ssr/page',
  routes: [
    {
      path: '/',
      exact: true,
      Component: () => (require('@/page/index').default), // 这里使用一个function包裹为了让它延迟require
      controller: 'page',
      handler: 'index'
    },
    {
      path: '/news/:id',
      exact: true,
      Component: () => (require('@/page/news').default),
      controller: 'page',
      handler: 'index'
    }
  ],
  baseDir: resolvePath('../'),
  injectCss: [
    `${staticPrefix}/static/css/Page.chunk.css`
  ], // 客户端需要加载的静态样式表
  injectScript: [
    `<script src='${staticPrefix}/static/js/runtime~Page.js'></script>`,
    `<script src='${staticPrefix}/static/js/vendor.chunk.js'></script>`,
    `<script src='${staticPrefix}/static/js/Page.chunk.js'></script>`
  ], // 客户端需要加载的静态资源文件表
  serverJs: resolvePath(`../dist/Page.server.js`)
}
