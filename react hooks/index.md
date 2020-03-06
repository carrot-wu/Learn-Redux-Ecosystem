## react hooks
1. React是内部是怎么不用的hooks的
2. React是如何在每次重新渲染之后都能返回最新的状态
3. 状态究竟存放在哪？为什么只能在函数顶层使用Hooks而不能在条件语句等里面使用Hooks

### 解释
```ts
// react-reconciler/src/ReactFiberHooks.js
// Mount 阶段Hooks的定义
const HooksDispatcherOnMount: Dispatcher = {
  useEffect: mountEffect,
  useReducer: mountReducer,
  useState: mountState,
 // 其他Hooks
};

// Update阶段Hooks的定义
const HooksDispatcherOnUpdate: Dispatcher = {
  useEffect: updateEffect,
  useReducer: updateReducer,
  useState: updateState,
  // 其他Hooks
};
```
hooks在mount阶段和update阶段是不一样的。
### mount阶段
在调用阶段当执行hooks的时候
```ts
// react-reconciler/src/ReactFiberHooks.js
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    baseState: null,
    queue: null,
    baseUpdate: null,
    next: null,
  };
  if (workInProgressHook === null) {
    // 当前workInProgressHook链表为空的话，
    // 将当前Hook作为第一个Hook
    firstWorkInProgressHook = workInProgressHook = hook;
  } else {
    // 否则将当前Hook添加到Hook链表的末尾
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}
```
会根据hooks的执行顺序通过链表的方式把一个个连接起来（通过.next链接）。
```ts
//hook对象
{
    memoizedState: null,
    baseState: null,
    queue: null,
    baseUpdate: null,
    next: null,
  }
```
对于第一个hooks会直接把当前hooks对象赋值给fiberNode的memoizedState对象上，之后的hooks会通过链表.next的形式串联起来。这样子就形成了hooks链表，因为在每一次循环就能通过.next来获取具体的hooks(简单说就是react并不知道调用的是哪个hooks只知道hooks的对应顺序而已)。之所以使用链表的原因就是因为，hooks的更新会进行频繁的插入操作，而且需要通过表头来方便的获取最新值，链表的性能更高（因为后续的每次更新操作actions都会在当前hooks对象中插入到queue中，queue会用来循环调用获取最新的state值）

### 调用set函数
在调用set函数的过程中，每一个hooks内部也维护着一个更新链表queque，当前的更新链表保存着每一次更新的update对象。每一次调用set函数的时候把会update对象最新值放在链表的最末尾。链表内的值时一组循环引用的链表值具体可以看图片
在获取最新值得时候，hooks会把hook的queuestate的每一次set函数的update对象之取出来。如果是useState的话直接返回即可，如果是useReducer的话循环调用即可获得最新的reducer值。

### hooks链表放在那里
组件构建的Hooks链表会挂载到FiberNode节点的memoizedState上面去。

### useEffect和useLayoutEffect副作用的函数
与前面的类型，fiber node中用一个updateQuene的属性保存着所有的useEffect。
1. 在mount的时候会把所有effect通过链表的形式保存起来。在渲染完成之后就会执行fiberNode上的updateQueue所有effect方法。
2. update阶段有点类似，不过update阶段时会判断两次大的dep值，只有dep值发生改变的effect才会保存在fiberNode中然后重新

--------具体可参考下面链接 会更清楚-0--------


## 参考
https://juejin.im/post/5e5e66d6e51d4526e651c796
