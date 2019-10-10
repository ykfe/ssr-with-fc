const resolvePath = (path) => require('path').resolve(process.cwd(), path)
const isDev = process.env.local || process.env.NODE_ENV === 'development'
const prefix = isDev ? '/2016-08-15/proxy/ssr/page' : '' // 静态资源路径前缀

module.exports = {
  type: 'ssr', // 指定运行类型可设置为csr切换为客户端渲染
  prefix,
  runtime: 'fc',
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
  injectCss: [
    `${prefix}/static/css/Page.chunk.css`
  ], // 客户端需要加载的静态样式表
  injectScript: [
    `<script src='${prefix}/static/js/runtime~Page.js'></script>`,
    `<script src='${prefix}/static/js/vendor.chunk.js'></script>`,
    `<script src='${prefix}/static/js/Page.chunk.js'></script>`
  ], // 客户端需要加载的静态资源文件表
  serverJs: resolvePath('./web/entry') // 请不要修改此路径否则将无法运行
}
