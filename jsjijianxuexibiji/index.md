>在阅读拉钩教育《前端基础建设与架构》中的学习笔记，好记性不如烂笔头。

## npm以及yarn的安装机制

### yarn

1. 若yarn.lock不存在，安装依赖并生成yarn.lock。
2. 若yarn.lock存在且与package.json中的版本范围匹配，yarn.lock保持不变，yarn不会检查是否有新版本。
3. 若yarn.lock不满足package.json中的所有依赖项，yarn将查找最新的满足package.json中约束的可用版本，并更新yarn.lock。

### npm

npm从5.0版本之后默认增加lockfile，但是早期不同版本对lockfile的实现有过变更

1. 5.0.x版本，不管package.json怎么变，install时都会根据lock文件下载。
2. 5.1.0版本后，npm install会无视lock文件，去下载最新的npm包。
3. 5.4.2版本后，表现和yarn.lock一致。

=============1=================

### 使用姿势
1. 提交每一次的lockfile更新
例如yarn add 一个新的依赖后，将package.json和yarn.lock的变化同时提交。

2. 不要混用包管理工具
例如项目的包管理工具是yarn，lockfile为yarn.lock。此时若执行npm install [some-dependency]，会更新package.json和新建一个package-lock.json，不会更新yarn.lock。

3. --frozen-lockfile的使用
即使有lockfile的存在，也无法保证在持续集成环境中每次安装依赖都和开发时一致，因为可能存在package.json和lockfile版本号不匹配并需要更新依赖版本的情况。可以使用--frozen-lockfile来避免。

### 到底该不该提交lockfile
把 package-lock.json 一起提交到代码库中，不需要 ignore。但是执行 npm publish 命令，发布一个库的时候，它应该被忽略而不是直接发布出去。

1. 如果开发一个应用，我建议把 package-lock.json 文件提交到代码版本仓库。这样可以保证项目组成员、运维部署成员或者 CI 系统，在执行 npm install 后，能得到完全一致的依赖安装内容。

2.如果你的目标是开发一个给外部使用的库，那就要谨慎考虑了，因为库项目一般是被其他项目依赖的，在不使用 package-lock.json 的情况下，就可以复用主项目已经加载过的包，减少依赖重复和体积。**如果作为库开发者，真的有使用某个特定版本依赖的需要，一个更好的方式是定义 peerDependencies。**