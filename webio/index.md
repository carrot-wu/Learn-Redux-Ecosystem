> 最近公司打算自研一套类似于百度统计以及腾讯mta类似的数据上报系统，我这边负责了客户端的上报sdk部分工作。接下来记录一下开发sdk时的相关要点。


以下是sdk支持上报的数据功能要点

## 页面浏览监控（PV/UV）
数据上报系统必不能少的就是页面数据PV/UV的监控，对于多页面来说我们可以监听`DOMContentLoaded`事件来进行上报数据（这里不再进行赘述），麻烦的是单页面（react，vue，ng）通过模拟路由修改不刷新页面的数据上报。如今绝大部分单页面的路由都是通过history或者hash这两种方式来进行路由切换，我们可以通过改写的方式来劫持相关事件就可以在路由跳转的时候进行数据上报。

### hash路由
对于hash路由，当路由发生变化的时候触发`onhashchange`事件，因此我们只需要重写`onhashchange`事件并且重写相关的上报逻辑即可。注意的是要保留原始的hashchange方法并且在最后记得调用返回即可.

```ts
export function rewriteOnHashChange() {
  // 保留原有的hashchange方法
  const originEventName = rewriteNameMap.onhashchange;
  if (!window[originEventName]) {
    window[originEventName] = window.onhashchange;
  }
  const originHashChange = isFunction(window[originEventName]) ? window[originEventName] : noop;
  window.onhashchange = function (event: HashChangeEvent) {
    // hash模式直接获取hash即可
    const formatUrl = parseUrl(event.newURL);
    const path = parseHashUrl(formatUrl.hash) || window.location.pathname;
    dispatchCustomEvent('hashStateChanged', {
      path,
    });
    return originHashChange.call(this, event);
  };
}
```

### history路由
跟hash路由相类似，history路由也有一个`onpopstate`事件用来监听路由修改。不过要注意以下几点:

1. popstate事件只会在浏览器某些行为下触发, 比如点击后退、前进按钮(或者在JavaScript中调用history.back()、history.forward()、history.go()方法)
2. 调用history.pushState()或者history.replaceState()不会触发popstate事件.
3. 对于a标签的跳转也不会触发popstate事件，对于react-router或者vue-router的单页面路由来说，它们是用过阻止a链接的默认事件手动触发相对应的pushState事件或者replaceState事件。
4. 当网页加载时,各浏览器对popstate事件是否触发有不同的表现,Chrome 和 Safari会触发popstate事件, 而Firefox不会.

因此，我们不仅仅要劫持onpopstate事件，同时也需要劫持pushState和replaceState事件。对于a标签的跳转，因为类似于vue-router的框架内部出发了pushState事件，不在需要监听a标签的事件。

```ts
/**
 * 重写statechange事件
 * 注意的是 因为history模式可能为hash 所以需要优先判断hash
 */
export function rewriteOnPopState() {
  // 保留原有的state方法
  const originEventName = rewriteNameMap.onpopstate;
  if (!window[originEventName]) {
    window[originEventName] = window.onpopstate;
  }
  const originPopState = window[originEventName];
  window.onpopstate = function (event: PopStateEvent) {
    // 优先获取hash的地址 不然的话在获取pathname的地址 因为有可能history模式使用的是hash模式
    const path = parseHashUrl(window.location.hash) || window.location.pathname;
    dispatchCustomEvent('historyStateChanged', {
      path,
    });
    return isFunction(originPopState) && originPopState.call(this, event);
  };
}

/**
 * 重写history replaceState 和 pushState事件
 * @param event
 */
export function rewriteHistoryState(event: 'pushState' | 'replaceState') {
  const originEventName = rewriteNameMap[event];
  // @ts-ignore
  if (!window.history[originEventName]) {
    // @ts-ignore
    window.history[originEventName] = window.history[event];
  }
  // @ts-ignore
  const originHistoryEvent = window.history[originEventName];
  if (isFunction(originHistoryEvent)) {
    window.history[event] = function (...historyArguments) {
      const { href } = window.location;
      const [, , url] = historyArguments;
      // 执行原来的history方法
      const originReturns = originHistoryEvent.apply(window.history, historyArguments);
      // 如果跳转的是原地址 或者地址不是字符串 或者跳转地址等于当前地址 那么直接返回不进行相关的上报操作
      // 都认为是在当前页面
      if (!url || !isString(url) || url === href) {
        return originReturns;
      }
      // 格式化的url格式
      const formatHref = parseUrl(href);
      const formatUrl = parseUrl(url);

      // 获取hash 有时候浏览器支持history模式 就算用的是hash也会以history模式为准
      const hrefHash = parseHashUrl(formatHref.hash);
      const urlHash = parseHashUrl(formatUrl.hash);
      // 跳转pathName不同的时候才进行historyStateChange事件派发
      if (formatHref.pathname !== formatUrl.pathname) {
        dispatchCustomEvent('historyStateChanged', {
          path: formatUrl.pathname,
        });
      } else if (hrefHash && urlHash && hrefHash !== urlHash) {
        // 有时候浏览器支持history模式 就算用的是hash也会以history模式为准
        dispatchCustomEvent('historyStateChanged', {
          path: urlHash,
        });
      }
      return originReturns;
    };
  }
}
```
**需要注意的是，在vue-router中只要浏览器支持history，即使你手动设置的是hash路由，vue-router内部会使用history api来模拟实现hash路由。所以需要在改写history路由时需要判断当前路由模式使用的是hash路由**


## 错误上报

老生常谈的东西-错误上报，在论坛或者掘金上已经有非常多非常棒的文章博客详细的研究过相对应的实现方式，这里我就不再进行赘述了。在项目中，对于全局的异常或者静态资源错误可以监听**error事件即可**，注意的是要判断具体是属于哪种错误。对于没有捕获的promise异常，监听**unhandledrejection**事件即可。

### CSS背景图片的错误上报(background)
在查找资源的过程中，对于css背景图片的资源错误处理根本找不到= =。对于背景图片的加载错误根本没法通过任何事件去捕获，难道就没有办法上报背景图片的加载错误吗？答案是可行的，我发现可以通过一种比较hack的方式来监听背景图片的错误事件。

大概思路如下：
1. 在页面加载完整之后，通过遍历dom数获取**backgroundImage**属性中的**url图片地址**
2. 手动实例化image元素，监听上面获取到的图片地址是否触发error事件即可

但是上面的思路对于静态页面来说是可行的，因为dom树不会再发生变化。但是对于vue和react这种动态渲染节点的框架来说，dom节点内容是动态的，背景图片的加载并不是一开始就初始化的。所以我们需要做到能够监听某个节点元素是否发生了变化，发生变化的时候重新遍历节点树背景图片的url地址。**MutationObserver**恰好可以用来监听元素节点的变化。

#### MutationObserver
以下内容摘自mdn:
MutationObserver接口提供了监视对DOM树所做更改的能力。它被设计为旧的Mutation Events功能的替代品，该功能是DOM3 Events规范的一部分。

```js
// 选择需要观察变动的节点
const targetNode = document.getElementById('some-id');

// 观察器的配置（需要观察什么变动）
const config = { attributes: true, childList: true, subtree: true };

// 当观察到变动时执行的回调函数
const callback = function(mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for(let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            console.log('A child node has been added or removed.');
        }
        else if (mutation.type === 'attributes') {
            console.log('The ' + mutation.attributeName + ' attribute was modified.');
        }
    }
};

// 创建一个观察器实例并传入回调函数
const observer = new MutationObserver(callback);

// 以上述配置开始观察目标节点
observer.observe(targetNode, config);

// 之后，可停止观察
observer.disconnect();
```

#### 实现
1. 通过MutationObserver监听根节点元素是否变化，变化的时候重新遍历收集元素的backgroundImage属性中的图片url地址
2. 手动实例化Image实例，监听图片是否加载失败上报即可。

```ts
// 用于处理背景图片错误时无法被捕获的事件
export function handleBackgroundError() {
  if (!MutationObserver) {
    return;
  }
  const { rootName } = getStoreVal();
  const cacheImageMap: { [k: string]: string } = {};
  // 选择需要观察变动的节点
  const targetNode = document.querySelector(rootName);
  // 观察器的配置（需要观察什么变动）
  const config = { childList: true, subtree: true };

  // 通过mutationObserve的dom变化来重新收集backgroundImage
  const observer = new MutationObserver(() => {
    try {
      const imageArray = getElementBackgroundImage(targetNode!);
      if (Array.isArray(imageArray) && imageArray.length) {
        imageArray.forEach((imageUrl) => {
          if (!cacheImageMap[imageUrl]) {
            cacheImageMap[imageUrl] = imageUrl;
            // 创建image元素
            const img = new Image();
            // @ts-ignore
            img.onerror = sendResourceError;
            img.src = imageUrl;
          }
        });
      }
    } catch (e) {
      console.warn('mutation observe error');
    }
  });
  observer.observe(targetNode!, config);
}

/**
 * 获取元素节点的背景图片地址
 * @param ele
 * @param cacheArray
 */
export function getCurrentElementBackgroundImage(ele: Element, cacheArray?: string[]) {
  const backgroundImageArray: string[] = isArray(cacheArray) ? cacheArray : [];
  const style = window.getComputedStyle(ele);
  if (!style || !style.backgroundImage) {
    return;
  }
  // 获取图片链接
  const reURL = /url\((['"])?(.*?)\1\)/gi;
  let matches = reURL.exec(style.backgroundImage);
  while (matches !== null) {
    const url = matches && matches[2];
    if (url) {
      backgroundImageArray.push(url);
    }
    matches = reURL.exec(style.backgroundImage);
  }
  return backgroundImageArray;
}

export function getElementBackgroundImage(ele?: Element) {
  const element = ele || document.querySelector('body');
  const imageArray = getCurrentElementBackgroundImage(element!);
  const children = element!.querySelectorAll('*');
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    getCurrentElementBackgroundImage(child, imageArray);
  }
  return imageArray;
}
```

## 页面性能监控

页面性能监控也是老生常谈了，网上也已经有大量的最佳实践。本质上都是原生的**PerformanceNavigationTiming** api来进行性能监控。注意的是**performance.timing**是早期第一版api，兼容性更好不过精度不高不太准，更推荐使用第二版的api**PerformanceNavigationTiming**（记得做好优雅降级哦）。具体的性能时间看下面这张图就ok啦。

111111111111111111111111111111111111111

具体的数据字典如下
```ts
// 页面性能数据字典
export const performanceDataMap: PerformanceDataMap = {
  // 阶段性指标
  dns: {
    arg: ['domainLookupEnd', 'domainLookupStart'],
    info: 'DNS查询耗时',
  },
  tcp: {
    arg: ['connectEnd', 'connectStart'],
    info: 'TCP链接耗时',
  },
  response: {
    arg: ['responseEnd', 'responseStart'],
    info: '数据传输耗时',
  },
  ttfb: {
    arg: ['responseStart', 'requestStart'],
    info: 'Time to First Byte（TTFB），网络请求耗时',
  },
  dom: {
    arg: ['domInteractive', 'responseEnd'],
    info: '可交互 DOM 解析耗时',
  },
  dom2: {
    arg: ['domContentLoadedEventStart', 'domInteractive'],
    info: '剩余 DOM 解析耗时(DOMContentLoaded 所有DOM元素都加载完毕(除了 async script))',
  },
  appCache: {
    arg: ['domainLookupStart', 'fetchStart'],
    info: '缓存耗时',
  },
  redirect: {
    arg: ['redirectEnd', 'redirectStart'],
    info: '重定向耗时(过多重定向影响性能)',
  },
  unload: {
    arg: ['unloadEventEnd', 'unloadEventStart'],
    info: '前一个页面卸载耗时(前一个页面卸载时可能监听了 unload 做些数据收集，会影响页面跳转)',
  },
  DCL: {
    arg: ['domContentLoadedEventEnd', 'domContentLoadedEventStart'],
    info: "DOMContentLoaded 事件耗时(document.addEventListener('DOMContentLoaded', cb))",
  },
  resources: {
    arg: ['loadEventStart', 'domContentLoadedEventEnd'],
    info: '资源加载耗时(完整DOM(DOMContentLoaded)到资源加载完毕(window.onLoad)时间)',
  },
  onLoad: {
    arg: ['loadEventEnd', 'loadEventStart'],
    info: 'onLoad事件耗时',
  },
  firstByte: {
    arg: ['responseStart', 'domainLookupStart'],
    info: '首包时间',
  },
  fpt: {
    arg: ['responseEnd', 'fetchStart'],
    info: 'First Paint Time, 首次渲染时间 / 白屏时间(从请求开始到浏览器开始解析第一批 HTML 文档字节的时间差)',
  },
  tti: {
    arg: ['domInteractive', 'fetchStart'],
    info: 'Time to Interact，首次可交互时间(浏览器完成所有 HTML 解析并且完成 DOM 构建，此时浏览器开始加载资源)',
  },
  ready: {
    arg: ['domContentLoadedEventEnd', 'fetchStart'],
    info: 'HTML 加载完成时间， 即 DOM Ready 时间(如果页面有同步执行的 JS，则同步 JS 执行时间 = ready - tti)',
  },
  load: {
    arg: ['loadEventStart', 'fetchStart'],
    info: '页面完全加载时间(load = 首次渲染时间 + DOM 解析耗时 + 同步 JS 执行 + 资源加载耗时)',
  },
};

```