# SSR 结合 阿里云 Serverless FC(function computed) 示例

在本项目中，我们将[egg-react-ssr](https://github.com/ykfe/egg-react-ssr)项目运行在阿里云Serverless函数计算服务[FC](https://help.aliyun.com/document_detail/52895.html?spm=a2c4g.11186623.6.541.45c9368bqWeNxZ)上

[在线地址](http://egg.fedte.cc/)

## Serverless

> Serverless 架构是指大量依赖第三方服务（也叫做后端即服务，即“BaaS”）或暂存容器中运行的自定义代码（函数即服务，即“FaaS”）的应用程序，函数是无服务器架构中抽象语言运行时的最小单位。在这种架构中，我们并不看重运行一个函数需要多少 CPU 或 RAM 或任何其他资源，而是更看重运行函数所需的时间，我们也只为这些函数的运行时间付费。

即我们只需要关注每一个函数自身的逻辑，而不用操心运行环境等细节，当有事件到来时触发执行，根据执行情况可以卸载。免去管理基础设施、网络资源、实例缩放和系统负载平衡的困扰。您只需要上传您的代码到云服务，它会保障您应用的高可用性和高可拓展性。可以更专注于开发业务逻辑

## 开始使用 

使用之前确保电脑已经安装好[docker](https://github.com/alibaba/funcraft/blob/master/docs/usage/installation-zh.md)并且启动，且全局安装[@alicloud/fun](https://github.com/alibaba/funcraft/blob/master/docs/usage/installation-zh.md), 并且通过`fun config`进行账户的身份信息设置

## 配置文件介绍

```yaml
ROSTemplateFormatVersion: '2015-09-01' # fc固定格式内容要求
Transform: 'Aliyun::Serverless-2018-04-03' # fc固定格式内容要求
Resources:
 egg.fedte.cc: # 自定义线上域名
    Type: 'Aliyun::Serverless::CustomDomain'
    Properties:
      Protocol: HTTP
      RouteConfig:
        routes: # 应用路由
          '/*':
            ServiceName: ssr
            FunctionName: page
  ssr: # server name 服务名
    Type: 'Aliyun::Serverless::Service'
    Properties:
      Description: 'fc ssr demo'
    page: # function name 方法名
      Type: 'Aliyun::Serverless::Function' # 字段类型
      Properties:
        Handler: index.handler
        CodeUri: '.' # 工作目录
        Description: 'fc ssr demo with nodejs8!'
        Runtime: nodejs8 # 运行环境
      Events:
        http-test:
          Type: HTTP
          Properties:
            AuthType: ANONYMOUS
            Methods: ['GET'] # 支持的方法
```

## 本地运行

本地开发使用以下命令启动服务，支持HMR

```
$ npm i
$ npm start
$ open http://localhost:8000/2016-08-15/proxy/ssr/page/ // 以FC SSR 模式运行
$ open http://localhost:8888/2016-08-15/proxy/ssr/page/ // 以 CSR 模式运行
```

注：FC启动的应用链接规范为 `http://localhost:8000/2016-08-15/proxy/${service name}/${function name}/`

## 执行流程

这里简单介绍一下FC-SSR应用的执行流程

![](https://img.alicdn.com/tfs/TB1V_57iAT2gK0jSZFkXXcIQFXa-1948-702.jpg)

### 使用express代替原生的http trigger提供的对象

首先, 我们用了express作为我们的Node框架，之所以不用FC原生的http trigger(触发器)提供的对象，是因为我们生产环境需要用到静态资源托管这个功能，且FC原生的请求上下文对象是http模块提供的(req, res)经过处理后的对象，在属性上有一些缺失。

关于FC如何接入express请查看该[教程](https://github.com/muxiangqiu/fc-express-nodejs8)

### 本地开发代理前端静态资源支持HMR

如果你对[egg-react-ssr](https://github.com/ykfe/egg-react-ssr)这个项目熟悉的话，在本地开发我们用ykcli去编译我们的前端静态资源文件放在内存中，并且通过webpack-dev-server启动一个服务托管它们。在我们本地开发时我们需要使用这些内存中的文件而不是本地硬盘中的文件。

#### 设置publicPath

我们需要将`webpack.config.client.js`的publicPath设置为`/2016-08-15/proxy/ssr/page/`, 为什么要这么设置在`hot-update.json`中会讲到
你会发现我们的前端静态资源文件实际上是被编译到 `http://localhost:8888/2016-08-15/proxy/ssr/page/static/css/Page.chunk.css` 这样的路径下面(与FC应用路径唯一的区别只是端口不一致)
这里我们使用`express-http-proxy`这个库来转发我们的请求

#### 代理hot-update.json文件

这里有一个需要注意的地方就是，HMR功能需要去加载一个 `hot-update.json` 这样的文件来实现，但是webpack会用当前页面的端口以及publicPath作为路径去下载该文件。如果我们还是和之前一样设置`publicPath='/'`的话，那么实际请求的路径是`localhost:8000/hot-update.json` 这样的路径并没有被我们的FC应用的http触发器所监听到，所以不会触发Proxy，必须得是`localhost:8000/2016-08-15/proxy/ssr/page/xxx`这样的路径才会触发，所以我们需要设置 `publicPath='/2016-08-15/proxy/ssr/page/'`

### docker 应用访问宿主机服务

由于我们的前端静态资源是在宿主机而不是在docker中启动的，所以我们没办法在FC应用中通过localhost来访问宿主机资源，这里有两种方式

- 通过ifconfig查看本机ip，替换localhost
- 使用host.docker.internal来访问宿主机服务

## 两种线上发布方式

由于FC有应用发布大小的限制，压缩后代码小于50M, 解压后小于200M。所以与egg-react-ssr项目我们的发布方式不同，在生产环境我们修改了`webpack.config.server.js`去除了`externanls`选项来将一些第三方库与我们的bundle.server.js打在了一起，经过测试在生产环境压缩后的bundle.server.js在200kb左右时性能无明显影响，但当第三方库过多时如果超过几MB时对ttfb性能有影响。优点是我们不需要将node_modules上传到云端了发布速度更快, 需要发布的包更小。
`注：由于需要使用webpack去处理服务端Node相关代码，由于webpack require expression的特性不支持动态故请不要随意修改本应用目录结构，否则可能无法运行`
发布前确保已经通过fun config进行个人帐户的设置，且需要绑定[自定义域名](https://help.aliyun.com/document_detail/90722.html?spm=a2c4g.11174283.6.682.1a245212Zcy5ax)解析到FC的触发器,否则无法访问

那么让我们来对比一下两种发布方式的优缺点

### 打包开启externals选项

开启此选项的目的是将第三方模块依赖外置，此时需要保证我们的运行环境存在node_modules, 为了尽量控制包大小，我们只安装生产环境所需依赖

- 优点： 启动速度更快，服务端bundle更小
- 缺点： 需要上传的代码量大，上传速度慢

```
$ npm run build
$ rm -rf node_modules && npm i --production
$ fun deploy
```

bundle.server.js 大小 开发环境在 260kB 左右， 生产环境在 6KB 左右

具体发布信息

![](https://img.alicdn.com/tfs/TB1cxh4iLb2gK0jSZK9XXaEgFXa-1188-790.jpg)

可以看到我们上传了压缩后在20MB大小的代码，上传时间大概在20S左右

![](https://img.alicdn.com/tfs/TB15YR6iNn1gK0jSZKPXXXvUXXa-2878-1222.jpg)

TTFB 时间在 50ms 左右 白屏时间在 168ms 左右

![](https://img.alicdn.com/tfs/TB1yOt4iKT2gK0jSZFvXXXnFXXa-2492-990.jpg)

函数执行时间 8ms， 运行内存在25MB

### 不开启externals选项

通过这种方式我们将node_modules中的依赖与我们的业务代码打包在了一起

- 优点，上传速度快，需要上传的总代码量变小
- 缺点，服务端bundle会变大很多，特别是本地开发的时候明显增大

```
$ npm run build && fun deploy
```

bundle.server.js 大小 开发环境在 16MB 左右， 生产环境在 3.6MB 左右

具体发布信息

![](https://img.alicdn.com/tfs/TB1c9iXiUY1gK0jSZFCXXcwqXXa-1134-746.jpg)

可以看到我们上传了压缩后在1MB大小的代码，上传时间大概在2S左右

![](https://img.alicdn.com/tfs/TB1cfd7iFT7gK0jSZFpXXaTkpXa-2878-1350.jpg)

TTFB 时间在 50ms 左右 白屏时间在 168ms 左右

![](https://img.alicdn.com/tfs/TB1Icd7iFT7gK0jSZFpXXaTkpXa-2490-930.jpg)

函数执行时间 6ms， 运行内存在30MB

### 总结

通过性能对比我们可以发现后者的上传发布速度明显快于前者，虽然在本例中白屏时间对比不是很明显，但随着第三方依赖的增多可以预计TTFB时间必然是要增大的。根据本地开发打包的性能显示当bundle.server.js大小超过15MB时对性能有较明显影响。

## Serverless与传统方案对比

相较于我们传统的应用发布方案，Serverless存在以下诸多优势

- 降低启动成本
- 实现快速上线
- 系统安全性更高
- 自动扩缩容能力

### 降低启动成本

当我们作为一家公司开发一个 Web 应用时，在开发的时候，我们需要版本管理服务器、持续集成服务器、测试服务器、应用版本管理仓库等作为基础的服务。线上运行的时候，为了应对大量的请求，我们需要一个好的数据库服务器。当我们的应用面向了普通的用户时，我们需要：
邮件服务，用于发送提醒、注册等服务
短信服务（依国家实名规定），用于注册、登录等用户授权操作
对于大公司而言，这些都是现成的基础设施。可对于新创企业来说，这都是一些启动成本。

### 快速上线

对于一个 Web 项目来说，启动一个项目需要一系列的 hello, world。当我们在本地搭建环境的时候，是一个 hello, world，当我们将程序部署到开发环境时，也是一个部署相关的 hello, world。虽然看上去有些不同，但是总的来说，都是 it works!。
Serverless 在部署上的优势，使得你可以轻松地实现上线。

### 系统安全性更高

在 Serverless 架构下每个函数都是独立虚拟机级别环境运行互不干扰，并且我们不需要操心服务器被攻击的事情了，这些问题云服务商都会帮我们解决

### 自动扩缩容

Serverless第二个常被提及的特点是自动扩缩容。前面说了函数即应用，一个函数只做一件事，可以独立的进行扩缩容，而不用担心影响其他函数，并且由于粒度更小，扩缩容速度也更快。而对于单体应用和微服务，借助于各种容器编排技术，虽然也能实现自动扩缩容，但由于粒度关系，相比函数，始终会存在一定的资源浪费。比如一个微服务提供两个API，其中一个API需要进行扩容，而另一个并不需要，那么这时候扩容，对于不需要的API就是一种浪费。

## 未来可优化空间

目前看起来本项目所包含的文件还是略有多余。在之后我们将会将egg, koa, express 等框架内置进 faasruntime，启动的时候指定框架类型即可。且相关的webpack配置之后将会以脚手架的形式进行封装而不暴露在应用内部