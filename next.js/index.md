
## 引子
这段时间莫名的对ssr产生了兴趣，开始捣鼓着把原来用`create-react-app`的项目用`next.js`重构成服务端渲染。下面记录一下一些要点以及踩坑之旅

## next.js的使用

因为原来的博客前端是用ts写的，nextJs也贴心的内置了typescript的支持。再原来创建的模板基础上执行两条命令即可


```js
touch tsconfig.json
yarn add --dev typescript @types/react @types/node
yarn dev
```

## scss的引入以及支持私有样式

next.js内置已经支持了scss的支持，官网有介绍这边就不赘述了。但是使用过`create-react-app`编写过项目的人都知道。react能够自动识别`.module.scss`为组件私有样式，而`.scss`为全局样式。next.js并不支持，只允许全为模块化或者非模块化。

经过一系列的查找终于发现了一个老外写的插件`@webdeb/next-styles`,已经搬我们做了处理。在`next.config.js`引入重写即可.

```js
const withStyles = require('@webdeb/next-styles')
const withImages = require('next-images')
// next-styles
// 支持less和scss的next插件 老外写的
// 这个插件支持create-react-app的样式写法支持
// 自动识别module.(scss|sass|less)为模块化样式
// xxx.scss为全局样式
module.exports = withImages(withStyles({
  modules: true,
  sass: true, // use .scss files
  cssLoaderOptions: {
    importLoaders: 2,
  },
  sassLoaderOptions: {
    sassOptions: {
      includePaths: ["./src"], // @import 'variables'; # loads (src/styles/varialbes.scss), you got it..
    },
  },
  webpack (config, options) {
    config.module.rules.push({
      test: /\.(svg|eot|ttf|woff|woff2)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000
        }
      }
    })
    return config
  }
}))
```

## 自定义server端
next.js通过page目录下的文件来创建配置相关路由，不过我想着还是做自定义server端更自由一点。

在项目根目录下新建server文件夹，新建`index.ts tsconfig.json`等文件。原本项目根目录下的`tsconfig.json`并不适用于server端的ts文件。

原因是因为src下的目录下react文件是要运行在浏览器端的。所以要使用es6的模块，而我们server下的文件是运行在node下的，所以必须编译成commonjs模块.

```js
// src tsconfig.json
{
  compilerOptions： {
    "module": "esnext",
  }
}

// server
{
  compilerOptions： {
    "module": "commonjs",
  }
}
```

修改`package.json`的dev命令为:

```js
{
  scripts: {
    "dev": "cross-env NODE_ENV=development TS_NODE_PROJECT='./server/tsconfig.json' ts-node-dev --respawn  --transpileOnly --ignore-watch=.next --ignore-watch=node_modules --ignore-watch=src server/index.ts",
  }
}
```
![alt](http://img.carrotwu.com/Fk8saVU2ODPqvHIgbN00LIPBCFpn)

## server端支持/xx/:id的动态路由

next.js因为是通过pages目录下的文件来确定路由，所以并不支持以往的动态路由写法。因此在访问动态路由时会因为查找不到路由返会404.

因为上面我们是自定义服务端，所以我们可以在服务端识别到动态路由时把他转化为`/xx?id=id`的query路由地址即可:

```ts
// config.ts
const routerArray: IRoute[] = [
  {
    name: '首页',
    path: '',
    key: 'index',
    page: '/blog'
  }
  {
    name: '详情',
    path: '/post/:id',
    key: 'post',
    page: '/post'
  }
  {
    name: '分类列表',
    path: '/tagList/:key',
    key: 'tagList',
    page: '/tagList'
  }
]
import * as KoaRouter from 'koa-router';
import routerArray from './config';

const router = new KoaRouter()

function getRoute(handle: any): KoaRouter {
  routerArray.forEach(routeObject => {
    const { path: routePath, page } = routeObject
    // next.js不支持 /xx/:id这样子的路由路径
    // 只支持/xx?id=id这样子的路径
    // 所以我们在koa服务端这边做处理
    router.get(routePath, async ctx => {
      const { req, res, params, path } = ctx
      await handle(req, res, {
        pathname: page || path,
        query: params
      })
      ctx.respond = false
    })
  })
  return router
}
export default getRoute

```

## 接口代理

自定义服务器使得接口代理十分简单，因为我使用的是koa 引入`koa2-proxy-middleware`这个中间件即可。

```ts
import * as Koa2ProxyMiddleware from "koa2-proxy-middleware";
const options: Koa2ProxyMiddleware.Koa2ProxyMiddlewareConfig = {
  targets: {
    '/api/(.*)': {
      // this is option of http-proxy-middleware
      target: 'https://xxx', // target host
      changeOrigin: true
    }
  }
}

export default Koa2ProxyMiddleware(options)

// index.ts
server.use(proxyMiddleware)
```

## getInitialProps使用redux

其实redux的集成其实已经有很多资料讲述了用法，我这边不在进行赘述；只是在使用redux的过程中出现可一个问题：页面中的数据是在componentDidMount中获取然后dispatch到redux中，页面获取数据是通过redux获取的，而不是在传入的props中。因此在服务端渲染的时候getInitialProps中如何获取到store然后dispatch完数据之后通过注水的方式让页面在客户端就能拿到已经填充好数据的store就是下面要解决的问题所在。

### 高阶函数withReduxHoc

通过一个高阶函数withReduxHoc，我们可以自定义`_app.tsx`在高阶函数初始化的时候创建一个新的reduxStore。然后获取页面page组件的getInitialProps函数，把当前的reduxStore也注入进去。

```js
export default function withReduxHoc(AppComponent) {
  class WithReduxApp extends React.Component {
    constructor (props) {
      super(props)
      this.reduxStore = getOrCreateStore(props.initialReduxState)
    }

    render () {
      const { Component, pageProps, ...rest } = this.props
      return (
        <AppComponent
          {...rest}
          Component={Component}
          pageProps={pageProps}
          reduxStore={this.reduxStore}
        />
      )
    }
  }

  WithReduxApp.getInitialProps = async (ctx) => {
    // 初始化store

    let reduxStore  = getOrCreateStore()

    // 注入store
    ctx.reduxStore = reduxStore

    let appProps = {}
    //@ts-ignore
    if (isFunction(AppComponent.getInitialProps)) {
      //@ts-ignore
      appProps = await AppComponent.getInitialProps(ctx)
      // 获取页面组件的getInitialProps函数并且注入store，因此在页面组件的getInitialProps的ctx参数中就可以获取store
    }

    // 页面组件dispatch完更新store数据之后 在这里获取数据进行注水
    return {
      ...appProps,
      initialReduxState: reduxStore.getState()
    }
  }
  return WithReduxApp
}
```

在页面组件的getInitialProps函数中就可以获取到传入的store，在获取完数据之后调用store的dispatch方法更新store数据。

```ts
Home.getInitialProps = async (context: GetInitialPropsContext) => {
  const {reduxStore} = context
  let pageNum = 1
  let hasMore = true
  let list: ArticleListItem[]
  const {data} = await getArticleList({
    pageNum,
    pageSize: 5
  })
  if (data.totalPage <= pageNum) {
    hasMore = false
  }
  pageNum += 1
  list = data.list
  reduxStore.dispatch(updArticle(list))
  return {
    serverSucceed: true,
    serverPageNum: pageNum,
    serverHasMore: hasMore,
    serverList: list
  }

}

```