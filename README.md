# SSR 结合 阿里云 FC(function computed) 示例

本项目将我们的[egg-react-ssr](https://github.com/ykfe/egg-react-ssr)项目与阿里云Serverless函数计算服务[FC](https://help.aliyun.com/document_detail/52895.html?spm=a2c4g.11186623.6.541.45c9368bqWeNxZ)进行整合，在

## 开始使用 

使用之前确保电脑已经安装好[docker](https://github.com/alibaba/funcraft/blob/master/docs/usage/installation-zh.md)并且启动，且全局安装[@alicloud/fun](https://github.com/alibaba/funcraft/blob/master/docs/usage/installation-zh.md)

## 本地运行

本地开发使用以下命令启动服务，支持HMR

```
$ npm i
$ npm start
$ open http://localhost:8000/2016-08-15/proxy/ssr/page/ // 以FC SSR 模式运行
$ open http://localhost:8888/2016-08-15/proxy/ssr/page/ // 以 CSR 模式运行
```

## 执行流程

首先我们用了express作为我们的Node框架，之所以不用FC原生的http trigger(触发器)提供的对象，是因为我们需要用到静态资源托管这个功能，且FC原生的请求上下文对象是经过处理后的http模块提供的req, res 对象，在属性上有一些缺失。

关于FC如何接入express请查看该[文章](https://github.com/muxiangqiu/fc-express-nodejs8)

### 代理前端静态资源支持HMR

如果你对[egg-react-ssr](https://github.com/ykfe/egg-react-ssr)这个项目熟悉的话，在本地开发我们用ykcli去编译我们的前端静态资源文件放在内存中，并且通过webpack-dev-server启动一个服务托管它们。在我们本地开发时我们需要使用这些内存中的文件而不是本地硬盘中的文件。

#### 设置publicPath

我们需要将`webpack.config.client.js`的publicPath设置为`/2016-08-15/proxy/ssr/page/`, 为什么要这么设置在`hot-update.json`中会讲到
你会发现我们的前端静态资源文件实际上是被编译到 `http://localhost:8888/2016-08-15/proxy/ssr/page/static/css/Page.chunk.css` 这样的路径下面(与FC应用路径唯一的区别只是端口不一致)
这里我们使用`express-http-proxy`这个库来转发我们的请求

#### 代理hot-update.json文件

这里有一个需要注意的地方就是，HMR功能需要去加载一个 `hot-update.json` 这样的文件来实现，但是webpack会用当前页面的端口以及publicPath作为路径去下载该文件。如果我们还是和之前一样设置`publicPath='/'`的话，那么实际请求的路径是`localhost:8000/hot-update.json` 这样的路径并没有被我们的FC应用的http触发器所监听到，所以不会触发Proxy，必须得是`localhost:8000/2016-08-15/proxy/ssr/page/xxx`这样的路径才会触发，所以我们需要设置 `publicPath='/2016-08-15/proxy/ssr/page/'`

## 线上发布

由于FC有应用发布大小的限制，所以与egg-react-ssr项目不同，生产环境我们修改了`webpack.config.server.js`去除了`externanls`选项来将一些第三方库与我们的bundle.server.js打在了一起，经过测试在生产环境压缩后的bundle.server.js在200kb左右时性能无明显影响，但当第三方库过多时如果超过几MB时对性能有影响。优点是我们不需要将node_modules上传到云端了发布速度更快。
发布前确保已经通过fun config进行个人帐户的设置，且需要绑定[自定义域名](https://help.aliyun.com/document_detail/90722.html?spm=a2c4g.11174283.6.682.1a245212Zcy5ax)解析到FC的触发器,否则无法访问

```
$ npm run deploy
```