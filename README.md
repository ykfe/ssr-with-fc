# SSR 结合 阿里云 FC(function computed) 示例

本项目将我们的[egg-react-ssr](https://github.com/ykfe/egg-react-ssr)项目与阿里云Serverless函数计算服务[FC](https://help.aliyun.com/document_detail/52895.html?spm=a2c4g.11186623.6.541.45c9368bqWeNxZ)进行整合，在

## 开始使用 

使用之前确保电脑已经安装好[docker](https://github.com/alibaba/funcraft/blob/master/docs/usage/installation-zh.md)并且启动，且全局安装[@alicloud/fun](https://github.com/alibaba/funcraft/blob/master/docs/usage/installation-zh.md)

## 本地运行

本地开发使用以下命令启动服务，支持HMR

```
$ npm i
$ npm start
$ open http://localhost:8000/2016-08-15/proxy/ssr/page/
```

## 线上发布

由于FC有应用发布大小的限制，所以我们node_modules只安装生产环境需要的模块，发布前确保已经通过fun config进行个人帐户的设置，且需要绑定[自定义域名](https://help.aliyun.com/document_detail/90722.html?spm=a2c4g.11174283.6.682.1a245212Zcy5ax)解析到FC的触发器,否则无法访问

```
$ npm run deploy
```