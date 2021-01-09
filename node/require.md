
# 深入浅出require函数
>此文章来源于程序员成长指北公众号[《彻底搞懂 Node.js 中的 Require 机制(源码分析到手写实践)》](https://mp.weixin.qq.com/s?__biz=MzUxNzk1MjQ0Ng==&mid=2247487495&idx=1&sn=ce013f9f48a9df73ce5aeb8ef208c82a&chksm=f99116d6cee69fc075aa060821786add29e588dff709553cffec79e1a71d3df5a5a0bd77c193&scene=178&cur_album_id=1529105963545313281#rd)。加入了我自己的一些理解，感谢大佬的文章。

## 开篇问题
1. require 函数是如何产生的？为什么在 module 中可以直接使用。
2. require 加载原生模块时候如何处理的，为什么 require('net') 可以直接找到
3. Node.js 中 require 会出现循环引用问题吗？
4. require 是同步还是异步的？为什么？
5. exports 和 module.exports 的区别是什么？
6. 你知道 require 加载的过程中使用了 vm 模块吗？vm 模块是做什么的？vm 模块除了 require 源码用到还有哪些应用场景。

## CommonJS
众所周知nodeJs是基于commonjs，在commonjs中每一个文件对应一个模块。在模块内部中，我们可以通过require来引入其他模块，也可以通过module.export和export来向外导出其他某块。
CommonJS 规范规定，每个模块内部，module 变量代表当前模块。这个变量是一个对象，它的exports属性（即module.exports）是对外的接口。

1. require 函数是如何产生的？为什么在 module 中可以直接使用？为什么可以再模块中直接使用**exprort，require，module.exports，__dirname这些变量**。
2. require 加载原生模块时候如何处理的，为什么 require('net') 可以直接找到
3. Node.js 中 require 会出现循环引用问题吗？
4. Node.js 中 require 会出现循环引用问题吗？
5. require 是同步还是异步的？为什么？
6. exports 和 module.exports 的区别是什么？
7. 你知道 require 加载的过程中使用了 vm 模块吗？vm 模块是做什么的？vm 模块除了 require 源码用到还有哪些应用场景。

## require实现
>一下内容大部分从[彻底搞懂 Node.js 中的 Require 机制(源码分析到手写实践)]截取而来，后续会加上一些我自己的理解

### module类
上文说过，在nodejs中一个文件对应一个module实例，接下来我们实现一个简单的module类
```js
function KoalaModule(id = '') {
  this.id = id;       // 这个id其实就是我们require的路径
  this.path = path.dirname(id);     // path是Node.js内置模块，用它来获取传入参数对应的文件夹路径
  this.exports = {};        // 导出的东西放这里，初始化为空对象
  this.filename = null;     // 模块对应的文件名
  this.loaded = false;      // loaded用来标识当前模块是否已经加载
}

KoalaModule._cache = Object.create(null); //创建一个空的缓存对象
KoalaModule._extensions = Object.create(null); // 创建一个空的扩展点名类型函数对象(后面会知道用来做什么)
```
值的注意的是，在module类中我们保留了**路径（path），模块导出对象(exports)，还有一个用于缓存已加载模块的空对象**

### require源码
在源码中你会找到 require 函数,在 KoalaModule 的原型链上，我们实现下。真正执行的require函数其实是在module的静态函数上。

```js
Module.prototype.require = function(id) {
    return Module._load(id, this, /* isMain */ false);
};

KoalaModule._load = function (request) {    // request是我们传入的路劲参数
  // 2.路径分析并定位到文件
  const filename = KoalaModule._resolveFilename(request);

  // 3.判断模块是否加载过(缓存判断)
  const cachedModule = koalaModule._cache[filename];
  if (cachedModule !== undefined) {
    return cachedModule.exports;
  }
  // 4. 去加载 node 原生模块中
  /*const mod = loadNativeModule(filename, request);
   if (mod && mod.canBeRequiredByUsers) return mod.exports;*/
   
  // 5. 如果缓存不存在，我们需自行加载模块，new 一个 KoalaModule实例
  // 加载完成直接返回module.exports
  const module = new KoalaModule(filename);

  // 6. load加载之前加入缓存，这也是不会造成循环引用问题的原因，但是循环引用，这个缓存里面的exports可能还没有或者不完整
  KoalaModule._cache[filename] = module;
  // 7. module.load 真正的去加载代码
  module.load(filename);
  // 8. 返回模块的module.exports 
  return module.exports;
}
```

从上面得出，执行require函数的时候大致会执行这么个流程：

1.根据传入的路径获取模块文件的模块名以及模块地址
2. 判断模块是否已经加载过，根据上面创建的缓存空对象进行判断。有缓存的话直接返回缓存的模块，直接退出。
3. 从node原生模块开始进行查找（path，fs等等），没有的话确定是第三方模块（一般认为node_modules模块）
4. 先创建一个module实例，注意这时候的module实例只有路径和文件名字内部exports对象还是空的
5. 在真正的加载对应的模块之前，先把当前空的模块实例进行缓存。这样子就解决了循环引用的问题（a引用b，a其实已经缓存了哪怕这时候b引用a直接返回缓存的a模块，不再会进行真正的模块引用）
6. 通过module.load真正的去加载模块代码
7. 返回当前模块（注意的是这时候返回的其实是module.exports， 所以这时候导出的其实是module.exports的引用。后面会解析module.exports和exports的区别）

#### 路径分析并定位到文件
找到源码中的 _resolveFilename 函数，这个方法是通过用户传入的require参数来解析到真正的文件地址。(源码地址：https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js#L816)

这个函数源码中比较复杂，因为 require传递过来的值需要一层一层的判断，同时支持多种参数：内置模块，相对路径，绝对路径，文件夹和第三方模块等等，如果是文件夹或者第三方模块还要解析里面的 package.json 和 index.js。这里简单处理，只实现通过相对路径和绝对路径来查找文件，并支持判断文件js和json后缀名判断:

```js
KoalaModule._resolveFilename = function (request) {
  const filename = path.resolve(request);   // 获取传入参数对应的绝对路径
  const extname = path.extname(request);    // 获取文件后缀名
  // 如果没有文件后缀名，判断是否可以添加.js和.json
  if (!extname) {
    const exts = Object.keys(KoalaModule._extensions);
    for (let i = 0; i < exts.length; i++) {
      const currentPath = `${filename}${exts[i]}`;

      // 如果拼接后的文件存在，返回拼接的路径
      if (fs.existsSync(currentPath)) {
        return currentPath;
      }
    }
  }
  return filename;
}
```

#### 判断模块是否加载过(缓存判断)

判断这个找到的模块文件是否缓存过，如果缓存过，直接返回 cachedModule.exports, 这里就会想到一个问题为什么在 Node.js 中模块重复引用也不会又性能问题，因为做了缓存。(源码位置：https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js#L747)
```js
  const cachedModule = koalaModule._cache[filename];
  if (cachedModule !== undefined) {
    return cachedModule.exports;
  }
```

#### 去加载 node 原生模块
> 说实话我没看懂，因为涉及到c++的内容所以需要跟深入的了解可以查看原作者的文章。

结论：Node.js 在启动时候直接从内存中读取内容，我们通过 require 加载 net 原生模块时，通过 NativeModule的compileForInternalLoader，最终会在 _source 中找到对应的源码字符串，然后编译成一个函数，然后去执行这个函数,执行函数的时候传递 nativeModuleRequire和internalBinding两个函数，nativeModuleRequire用于加载原生 js 模块，internalBinding用于加载纯C++ 编写的内置模块。

#### 创建一个 KoalaModule 实例
如果不是原生 node 模块，就会当作普通文件模块加载，自己创建一个 KoalaModule 实例，去完成加载。
```js
 const module = new KoalaModule(filename);
```

#### 添加缓存

我把这一小步骤单独提出的原因，想说明的是先进行缓存的添加，然后进行的模块代码的加载，这样就会出现下面的结论，Node.js 官网也有单独介绍,可以自己试一下。

1. main 加载a，a 在真正加载前先去缓存中占一个位置
2. a 在正式加载时加载了 b
3. b 又去加载了 a，这时候缓存中已经有 a 了，所以直接返回 a.exports，这时候 exports 很有可能是不完整的内容。

如果放在代码模块加载完成之后才进行缓存，那么就会出现：a加载b的时候a还没有缓存，所以这时候b又加载a就会导致又重新去加载a模块，这就导致了循环引用。

总结：**缓存不仅仅用来重复加载模块的性能以及速度，同时起到了防止循环应用的问题**

#### 加载模块

>module实例在加载模块时对应不同的文件后缀会使用不同的加载方法，接下来将直接介绍js的加载方法.

定位到加载 .js 的源码位置(https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js#L1092)

```js
KoalaModule._extensions['.js'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  module._compile(content, filename);
}
```
KoalaModule._extensions 中 _compile 函数的执行。找到对应的源码位置(https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js#L1037)，源码中这里还使用 proxy，我们进行一下简单实现。

```js
KoalaModule.wrapper = [
  '(function (exports, require, module, __filename, __dirname) { ',
  '\n});'
];

KoalaModule.wrap = function (script) {
  return KoalaModule.wrapper[0] + script + KoalaModule.wrapper[1];
};

KoalaModule.prototype._compile = function (content, filename) {
  const wrapper = KoalaModule.wrap(content);    // 获取包装后函数体

  // vm是 Node.js 的虚拟机模块，runInThisContext方法可以接受一个字符串并将它转化为一个函数
  // 返回值就是转化后的函数，compiledWrapper是一个函数
  const compiledWrapper = vm.runInThisContext(wrapper, {
    filename,
    lineOffset: 0,
    displayErrors: true,
  });
  const dirname = path.dirname(filename);
  // 调用函数，这里一定注意传递进的内容。
  compiledWrapper.call(this.exports, this.require, this,
    filename, dirname);
}
```
这里注意两个地方
- 使用 vm 进行模块代码的执行，模块代码外面进行了一层包裹,以便注入一些变量。(类似于webpack的require，其实也是通过包裹成一个立即执行函数行程模块)

```js
'(function (exports, require, module, __filename, __dirname) { ',
  '\n});'
```

- 最终执行代码的函数传递的参数
1. this: compiledWrapper函数是通过 call 调用的，第一个参数就是里面的this，这里我们传入的是 this.exports，也就是 module.exports,也就是加载的模块对象。
2. exports: compiledWrapper 函数正式接收的第一个参数是 exports，我们传的也是 this.exports,所以 js 文件里面的 exports 也是对module.exports 的一个引用。
3. require: 这个方法我们传的是 this.require，其实就是KoalaModule.prototype.require 函数，也就是 KoalaModule._load。
4. module: 我们传入的是 this，也就是当前模块的实例。
5. __filename：文件所在的绝对路径。
6. __dirname: 文件所在文件夹的绝对路径。
以上两点也是我们能在 JS 模块文件里面直接使用这几个变量的原因。

## 解答疑惑
回到上面的问题就不难得出答案了：
1. require 函数是如何产生的？为什么在 module 中可以直接使用。
require 到的文件，在 vm 模块最终执行的时，对代码进行了一层包裹，并且把对应的参数传递进去执行。
```js
`(function (exports, require, module, __filename, __dirname) { ${script} \n});`
```
在node.js中能够直接使用的比如require,exports,module.exports都是在模块加载时通过重新参数参数的变量。其中require指向的是Module类的load方法。
exports和module.exports指向的是同一个引用。


2. require 加载原生模块时候如何处理的，为什么 require('net') 可以直接找到.
require在加载模块的时候会尝试给没有后缀的路径加载后缀并且require在加载模块的时候顺序如下：
- 是否有缓存
- 是否原生模块（）
- 是否当前项目模块
- 是否第三方模块

3. Node.js 中 require 会出现循环引用问题吗？
不会，因为在真正加载模块之前，会实例化一个当前模块的module实例加入缓存中，循环引用的时候会直接返回缓存中的模块

4. require 是同步还是异步的？为什么？

同步的，因为require函数使用的都是sync函数

5. exports 和 module.exports 的区别是什么？

**exports和module.exports指向的是同一个引用。nodejs中模块最终导出的是module.exports，exports只是一个变量保存了modules.exports的引用。最终导出的内容都是modules.exports**
```js
exports === modules.exports // true
// 可行
exports.a = a
// 没用 只是改变了当前exports变量的指针地址 最终导出的module.exports还是空对象
exports = {a,b}

// 有用 直接修改module.exports的指针
module.exports = {a,b}

// 有用 直接修改指针上的变量
module.exports.a = a
```