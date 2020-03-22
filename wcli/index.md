> 这段时间在用 ts + node 开发一个属于我自己的命令行工具 wcli。这个工具集成了插件化的模式，允许通过安装插件对项目进行开发模式化的编辑，以及自动化的构建并且代码推送。这篇文章是对编写 wcli 过程中的总结以及一些心得。

## 为什么要开发这么一个命令行

1. 第一点就是。现在公司的项目虽然做到了自动化的部署，但是这个并没有做到自动化的构建。公司的上线流程依然是本地手动构建把打包好的文件手动推送到某个仓库，然后通过 jenkins 手动触发拉取静态文件生成镜像。后续通过 k8s 或者 swam 的形式部署到各台机器上。
   现在业界更流行的自动化构建部署方案应该是直接推送代码，通过 web hooks 的触发或者容器镜像服务拉取文件然后在服务器上自动进行构建然后再触发自动部署（我的博客就是这么做的，包括前后台）。
   但是没办法，每次手动构建需要选择各种环境，然后还要复制删除代码。一不小心就很容易打错生产环境变量的包，所以我想着通过命令行的方式来把这些工作交给机器，用户进行选择就好了。
   简单一点的话，其实在项目 package.json 添加一个 bin 属性引入相关的 node.js 代码即可进行。不过如果新增一个项目我就要引入相应的 node.js 代码实在是太麻烦了，所以最终还是决定通过编写一个全局命令行的包类似于 vue-cli 这样子的脚手架工具。

2) 第二点就是因为公司项目太老的关系，打包所有的路由等待时间实在是太久了，所以通过命令行的方式选择当前需要开发的路由减小路由的引入。这样子能够极大地减小开发效率，我司的一个项目原先每次热刷新要将近两分钟，通过 dev 的形式修改路由每次热刷新减小到 2s。

3) 写这么一个脚手架的另外一个好处就是，脚手架支持通过 git 或者 npm 的方式下载相应的插件，完全可以把所有的开发或者发布逻辑解耦到插件中，对于普通开发人员完全不会有任何心肌负担，只需要下载脚手架安装相应的项目插件即可。插件的开发可以交给项目特定人员。相比于在项目编写 bin 命令行把逻辑放入项目中，wcli 脚手架能无侵入式开发。

## 一些用到的库

接下来将列举一些脚手架开发过程中用到的库。

1. [**commander**](https://github.com/tj/commander.js): node.js 命令行界面的完整解决方案。允许你使用 node.js 快速方便的编写命令行工具。
2. [**colors**](https://github.com/Marak/colors.js): colors.js 是 NodeJS 终端着色 colors 插件能够美化终端打印出来的信息。
3. [**inquirer**](https://github.com/Marak/colors.js): 一个可嵌入式的美观的命令行界面，交互式命令行工具。
4. [**compressing**](https://www.npmjs.com/package/compressing): 一个能够在 node 环境上进行压缩和解压缩的库，我主要是用来解压`npm pack`时下载的 tgz 文件
5. [**download-git-repo**](https://www.npmjs.com/package/download-git-repo): 一个下载 github 或者 gitlab 远程仓库的库。
6. [**simple-git**](https://www.npmjs.com/package/simple-git): 一个支持在 node 环境上支持使用 git 命令的库。
7. [**fs-extra**](https://www.npmjs.com/package/fs-extra): 对于 node 原生的 fs 进行了封装，类似于 jq 的作用。

在 wcli 中暂时提供了三个命令**publish plugin dev**

## wcli publish

顾名思义，publish 就是允许你通过提前配置好一些项目配置，只需要你执行一条命令。那么插件会按照你与写的逻辑进行打包然后对打包的代码进行推送到你制定的仓库。当然你也可以通过一些交互选择打包的变量以及输入 commit 的 message 做到自定义的打包推送。
只需在 wcliconfig.json 文件夹中对 publish 变量进行一些相关的配置即可。

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

调用这条命令的过程中，wcli 会查找插件首页的 publish.js 并且进行执行。同时 wcli 提供了通用的上传仓库方法（当然你可以自己写），所以你可以先处理打包后的逻辑在执行相应提供的**publishFilwTithGit**方法即可快速的实现构建提交的逻辑。

```js
// publish.js
module.exports = async function(context) {
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
  } = context;

  // 处理打包的逻辑 通过交互进行环境的选择 生成了静态文件之后
  // 调用提供的publishFileWithGit方法即可进行推送
  const publishParams = {
    publishConfig: wcliConfigJson.publish,
    commitMsg: publishCommitMsg,
    token: publishToken
  };
  publishFileWithGit(publishParams);
};
```

## wcli plugin

### wcli plugin install

安装插件的操作，目前支持通过 npm 包的形式或者通过 github 或者 gitlab 的地址进行下载

1. 对于 git 地址的形式，wcli 会直接通过`download-git-repo`直接把库下载到目录的 plugin 目录下。
2. 对于 npm 包的话。最开始想着通过 node_modules 的形式管理插件，但是因为一些原因还是没有选择，通过`npm pack xxx`的形式直接把项目源码下下来之后进行解压缩放进 plugin 目录下。
3. 对于下下来的插件会自动进行 install（默认使用 yarn）

### wcli plugin list

通过表格显示安装的插件列表，包含插件名，是否 npm，插件的本地目录地址以及插件版本。
------------------2-----------------

### wcli plugin remove

可以删除插件,默认没有指定插件的话会删除 plugin 下所有目录，指定插件的话会删除指定的插件

### wcli plugin upgrade

**待开发中**，通过插件的版本号来判断是否需要更新，暂时还没开发。

## wcli dev

跟`wcli plugin`挺像，也是通过一些命令行的配置参数，比如说获取当前开发的路由，当前开发的调试环境以及代理地址等等你想自定义的事情，最后可以手动启动一个 devServer 方便开发（本质上还是通过项目 package.json 文件中的 script 命令进行执行）
