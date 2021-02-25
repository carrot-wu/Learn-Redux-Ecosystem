
# package.json模块导出之main,jsnext:main,module傻傻分不清

>最近在通过rollup写一个promise的通用工具库，其中在配置package.json中的模块导出声明有点犯迷糊因此这里做个笔记记录一下。

## 为啥要支持多模块导出

我们都知道的是rollup支持对外打包出不同模块化的代码，例如cjs（commonJs），esm（esModule），AMD，UMD等等。

对于不同环境的使用者来说，针对高版本的浏览器可以使用esm模块的代码，对于nodejs那么就可以使用cjs版本代码。使用哪种版本的代码应该交由使用者来选择。

## main,jsnext:main,module有啥区别
既然打包出了不同版本的代码，那么就需要在package.json配置中告诉使用者这个库提供了什么模块化的代码，所以一般在package.json中显式声明这几个变量：`main,jsnext:main,module`。例如下面这种形式：

```json
{
  "name": "xxx",
  "version": "1.0.0",
  "description": "",
  "main": "dist/index.main.js",
  "jsnext:main": "dist/index.esm.js",
  "module": "dist/index.esm.js",
  "browser": "dist/index.umd.js",
  "scripts": {
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {},
  "dependencies": {}
}

```
1. main: main 字段指明包的入口文件位置,默认 index.js。这里的文件应该放置 commonJs(cjs)模块, 如果源码需要被编译才能使用,那么此处的文件就必须已经被编译了

2. jsnext:main: 有一些工具,例如 webpack 能直接处理 import方式导入的模块。如果开发者希望自己的包交由使用者决定如何引入,那么可以将源码编译成ECMA(esm)

3. module: 与 jsnext:main 意义一样。但是 jsnext:main 是社区约定的字段,并非官方。而 module 则是官方字段。但是社区包含大量的插件只认识 jsnext:main,所以推荐同时使用 jsnext:main 和 module


### 最佳实践

| 字段 | 描述 | 文件格式 |
| ------ | ------ | ------ |
| main | nodejs 默认文件入口, 支持最广泛 | cjs |
| jsnext:main | 社区约定的 esm 文件入口, webpack, rollup 均支持该字段 | esm |
| module | esm 官方约定入口, 支持插件较少,故推荐和 jsnext:main 同时使用 | esm |

## 加餐 jsnext:main的那些事

一般我们在webpack性能优化中会经常看到使用tree-shaking的技术，其中有一条就是配置`resolve.mainfields`为数组：

```js
// webpack配置
resolve.mainfields: ['jsnext:main', 'module', 'main']

```
这样子配置的理由是告诉webpack在引入这个包的时候，从左到右依次查找。按照上面的表格可以看出其实就是告诉webpack优先查找已esm模块为导出的文件。  

之所以要优先查找esm模块，其实就是因为**tree-shaking只能针对esm模块的文件进行摇树优化**，本质上是因为**esm模块是基于编译时即编译的时候就能够知道模块中的依赖关系图，而cjs是基于运行时只有在运行的时候才能知道引入的模块是否有被使用**。  

另外来说esm模块导出的是值的引用，cjs导出的是值的浅拷贝。

具体的区别可自行查看其他大佬的文章吧。