# 轻设计项目

## 环境搭建
1、推荐使用`yarn`进行安装，没有安装过`yarn`的可以使用`npm`安装

```
npm i -g yarn
```

2、然后使用`yarn`安装依赖

```
yarn
```

3、在`env`目录下添加`local.js`文件，并添加如下代码

```javascript
const env = require('./test')
// const env = require('./pre')
// const env = require('./pro')

env.name = 'local'
env.port = '3333'

Object.assign(env.host, {
    cdn: '//local.yqxiu.cn',
    client: '//local.yqxiu.cn'

    // cdn: '//local.eqxiu.cc',
    // client: '//local.eqxiu.cc'

    // cdn: '//local.eqxiu.com',
    // client: '//local.eqxiu.com'

    // cdn: '//172.21.126.130',
    // client: '//172.21.126.130'
})

module.exports = env
```

4、修改`host`文件，添加`127.0.0.1 local.yqxiu.cn`，与`local.js`里的对应，否则执行`hot`模式时会报错

5、使用如下命令构建本地环境，其它环境下的命令可参考`package.json`文件

```
yarn hot
```

6、构建完成后会在当前目录下创建`dist`目录，里面有可访问的代码。如果布署到其它环境，还会生成一个`zip`目录，里面有相应的压缩包

7、配置`nginx`，参考如下。将`alias`换成自己的路径，保存后重启`nginx`

```
location /h2 {
    alias  /Users/xxx/h2/dist;
    index  index.html index.htm;
    try_files $uri $uri/ /index.html =404;
}
```

8、之后可以在浏览器中访问`http://local.yqxiu.cn/h2/create/[id]`

## 代码规范

* 使用`eslint`格式化代码
* `js`里不使用分号
* `html`里使用双引号，`js`里使用单引号
* 尽量用`const`，用不了的用`let`
* `tab`使用4个空格
* 文件最后空一行

## IDE

> 推荐使用`vs code`，并安装如下插件 vscode version 1.41

* ESLint
* Vetur
* Auto Rename Tag
* GitLens

在`用户设置`中添加如下内容

```
// 将设置放入此文件中以覆盖默认设置
{
    "eslint.validate": [
        "javascript",
        "javascriptreact"
    ],
    "window.zoomLevel": 1,
    "vetur.completion.autoImport": false,
    "eslint.packageManager": "yarn",
    "vetur.format.defaultFormatter.html": "none",
    "vetur.format.defaultFormatter.js": "none",
}
```

在`工作区设置`中添加如下内容，放在这主要是如果同时维护多个项目，其它的项目的规范可能并不一致，不需要在保存的时候格式化

```
{
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll": true
    }
}
```

这样在保存时就会按照`eslint`的规则格式化了

## Git

往`dev`合代码时，需要先`rebase` `dev`，再发`merge request`，这样看`log`时会比较清晰

## 编辑器组件层级

> 有一些全局的组件需要有一个层级规划，同级的按先后顺序

组件名称 | z-index | 说明
--- | --- | ---
错误提示 | 100
弹窗 | 99 | 未登录时，登录框需要在logo上面，这样logo能更早显示出来
开屏logo | 98
颜色选择器 | 96
文字云 | 95
箭头引导框 | 94
图层管理 | 93
DragIn | 10
Nav | 5
NavPanel | 4
Head | 2

## 游客模式

两种方案，目前采用方案2

1. 使用游客帐号，其余的操作都不用改，但带来的问题是这个帐号是有状态的，当其进入其它页面时，也能正常访问，这样就不好控制，需要其它的产品线配合
2. 不使用帐号，在创建、更新、保存时不使用身份认证，最后如果有注册的话则将这个作品和帐号进行关联

涉及的变化

* 分类页，如果已登录刷新后跳转到home，如果未登录，可以创建作品，并设置sessionStorage
* 编辑器，根据sessionStorage判断是否为游客。
    * 如果是游客，不调用身份验证接口，添加游客提示，无法使用上传功能（包括拖拽、复制、截图），无法使用付费模板，无法查看已购买模板，保存作品、保存页面、删除页面接口不进行身份验证，不需要初始化websocket。
    * 如果登录，删除sessionStorage，将作品绑定到新帐号上，其它功能都能正常使用。
