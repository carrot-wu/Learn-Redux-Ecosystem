## 前言

>这段时间在用ts + node开发一个属于我自己的命令行工具wcli。这个工具集成了插件化的模式，允许通过安装插件对项目进行开发模式化的编辑，以及自动化的构建并且代码推送。这篇文章是对编写wcli过程中的总结以及一些心得。

### 为什么要开发这么一个命令行
1. 第一点就是。现在公司的项目虽然做到了自动化的部署，但是这个并没有做到自动化的构建。公司的上线流程依然是本地手动构建把打包好的文件手动推送到某个仓库，然后通过jenkins手动触发拉取静态文件生成镜像。后续通过k8s或者swam的形式部署到各台机器上。
  现在业界更流行的自动化构建部署方案应该是直接推送代码，通过web hooks的触发或者容器镜像服务拉取文件然后在服务器上自动进行构建然后再触发自动部署（我的博客就是这么做的，包括前后台）。
  但是没办法，每次手动构建需要选择各种环境，然后还要复制删除代码。一不小心就很容易打错生产环境变量的包，所以我想着通过命令行的方式来把这些工作交给机器，用户进行选择就好了。
  简单一点的话，其实在项目package.json添加一个bin属性引入相关的node.js代码即可进行。不过如果新增一个项目我就要引入相应的node.js代码实在是太麻烦了，所以最终还是决定通过编写一个全局命令行的包类似于vue-cli这样子的脚手架工具。


2. 第二点就是因为公司项目太老的关系，打包所有的路由等待时间实在是太久了，所以通过命令行的方式选择当前需要开发的路由减小路由的引入。这样子能够极大地减小开发效率，我司的一个项目原先每次热刷新要将近两分钟，通过dev的形式修改路由每次热刷新减小到2s。

3. 写这么一个脚手架的另外一个好处就是，脚手架支持通过git 或者npm的方式下载相应的插件，完全可以把所有的开发或者发布逻辑解耦到插件中，对于普通开发人员完全不会有任何心肌负担，只需要下载脚手架安装相应的项目插件即可。插件的开发可以交给项目特定人员。相比于在项目编写bin命令行把逻辑放入项目中，wcli脚手架能辺无侵入式开发。

### 一些用到的库
接下来将列举一些脚手架开发过程中用到的库。

### commander
node.js命令行界面的完整解决方案。允许你使用node.js快速方便的编写命令行工具。

在wcli中暂时提供了三个命令**publish plugin dev**

1. publish。顾名思义，publish就是允许你通过提前配置好一些项目配置，只需要你执行一条命令。那么插件会按照你与写的逻辑进行打包然后对打包的代码进行推送到你制定的仓库。当然你也可以通过一些交互选择打包的变量以及输入commit的message做到自定义的打包推送。
  只需在wcliconfig.json文件夹中对publish变量进行一些相关的配置即可。
  ```ts
  export interface PublishConfig {
    // git地址
    git: string;
    // 仓库名
    repository: string;
    // 分支
    branch: string;
    // 替换的文件路径
    target: string;
    // 静态资源地址 默认是'dist'
    dist?: string;
    // 提交时的本地仓库路径 github的话必须提供 gitlab可以不用
    publishGitDir?: string;
}
  ```
  调用这条命令的过程中，wcli会查找插件首页的publish.js并且进行执行。同时wcli提供了通用的上传仓库方法（当然你可以自己写），所以你可以先处理打包后的逻辑在执行相应提供的**publishFilwTithGit**方法即可快速的实现构建提交的逻辑。
  ```js
  // publish.js
  module.exports = async function (context) {
  const {
    config: {
      wcliConfigJson,
      isDebug: debug,
      token: publishToken,
      publishCommitMsg
    },
    utils: {
      getCurrentBinFilePath,
      publishFileWithGitlabCommit,
      publishFileWithGit
    }
  } = context

  // 处理打包的逻辑 通过交互进行环境的选择 生成了静态文件之后
  // 调用提供的publishFileWithGit方法即可进行推送
  const publishParams = {
    publishConfig: wcliConfigJson.publish,
    commitMsg: publishCommitMsg,
    token: publishToken
  }
  publishFileWithGit(publishParams)
}
  ```
