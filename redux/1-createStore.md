## 前言

>在阅读源码的过程中我也翻阅了大量的资料。一般是先去看别人的源码分析完完整镇过的读一遍之后，看完了之后自己再把官网的clone下来自己再慢慢的阅读添加注释。希望大家在阅读完有感想之后也把官网源码clone下来不照着任何的资料边写注释边阅读完全部源码，这样子更有利于深刻理解。

**在工作中其实会经常使用到 redux 数据状态处理库，在一开始的使用中就一直听到说 reducer 必须是一个纯函数，不能有副作用!state 需要有一个默认值等等的约束。当然也踩过含有副作用修改了 state 造成视图层不更新的 bug(state 嵌套过深的锅。。。) 。一直停留在知其然不知其所以然的层次。想到彻底的掌握以及明白 redux 的原理的办法当然就是直接阅读源码啦。而且 redux 非常简洁才 2kb 而已= = 非常值得一读()**

> 为了好方便理解 我会先从 redux 提供的 api 入手 一步一步的深入解读

## redux 的基本使用

```javascript
//常用的三个api
import { createStore, combineReducers, applyMiddleware } from "redux";
//中间件
import thunk from "redux-thunk";
import logger from "redux-logger";
import { userReducer } from "./user/reducer";
import { todoReducer } from "./todo/reducer";
//combineReducers用于合并多个子reducer生成一个总的reducer
const reducers = combineReducers({
  userStore: userReducer,
  todoStore: todoReducer
});
//applyMiddleware使用中间件增强dispatch
const enhancer = applyMiddleware(thunk, logger);
//createStore 创建一个 Redux store 来以存放应用中所有的 state
// 应用中应有且仅有一个 store(react-redux有兼容多个store的写法，后面解读react-redux再说啦)
const store = createStore(reducers, null, enhancer);
//返回的store其实是一个对象，上面提供了一些常用的方法
// store.getState()用于获取store的state对象
console.log(store.getState());
// store.subscribe接受一个函数用于dispatch时执行
// 注意 subscribe() 返回一个函数用来注销监听器
const unsubscribe = store.subscribe(() => console.log(store.getState()));
// 发起一系列 action
store.dispatch(addTodo("Learn about actions"));
// 停止监听 state 更新
unsubscribe();
export default store;
```

> 明白了 redux 的基本用法之后我们就可以深入源码啦

上源码，为了减小篇幅，我删减了很多没用的代码（包括一些错误边界处理，其实很多错误边界处理都很有意思），如果想看完整的redux代码注释的话可以点击[**这里**](https://github.com/carrot-wu/Learn-Redux-Ecosystem "Markdown")。

## createStore

首先要明白的就是 redux 本质就是一个具有增强功能(中间件)的发布订阅函数 subscribe 就是订阅 dispatch 就是发布通知订阅者执行相应的回调
createStore 一开始会进行一系列的判断 判断是否传入了中间件（applyMiddleware（...）） 如果有的话直接返回 enhancer(createStore)(reducer, preloadedState) 没有的话继续执行下面的代码 声明了 dispatch subscribe getState replaceReudcer 这几个函数后直接进行返回

```javascript
export default function createStore(reducer, preloadedState, enhancer) {
  //首先createStore接受三个参数第一个是必须的reducer函数，第二个为state默认值（可传） 第三个enhancer为增强的中间件（可传，redux如此牛逼的原因）
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    //redux允许第二个参数直接传入中间件  判断第二个参数是否为函数 并且第三个参数为undefined（证明用户省略了state默认值，传入了第二个参数是中间件）
    enhancer = preloadedState
    preloadedState = undefined
  }

  if (typeof enhancer !== 'undefined') {
    //enhancer 必须是一个函数
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }
    //如果传入了中间件的话 那么就直接执行这个中间件函数 可查看applyMiddleware函数（为了方便理解我们先不看有中间件传入的createStore方法 跳过这里）
    return enhancer(createStore)(reducer, preloadedState)
  }
    //reducer必须是函数
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }
 ---------------------分隔符 下面都是不传入中间件执行的代码------------------------------------------
  let currentReducer = reducer
  let currentState = preloadedState
  //订阅监听器的函数组
  let currentListeners = []

  //拷贝之前的监听器函数组
  let nextListeners = currentListeners
  //是否处于dispatch的标识符
  let isDispatching = false

  function ensureCanMutateNextListeners() {
    //同步最新的监听器函数组  下面在订阅的时候会使用到
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }
  ...省略了dispatch subscribe getState replaceReudcer
  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
  }
}
```

## 获取 getState

我们知道执行 store.getState()会把当前的存在 store state 对象返回出来 看源码 惊喜吧没错就是这么简单

```javascript
function getState() {
  //直接了当的返回当前的state
  return currentState;
}
```

## 派发 dispatch

dispatch 的作用就是传入一个 action 对象 根据传入的 action 对象之后执行相应的 reducer 函数重新计算新的 state 出来 计算完成之后执行 listeners 里面的订阅函数（也就是 subscribe 啦）
**其中要注意的就是一些边界处理 比如 action 默认要有一个 type 属性 以及为什么 reducer 内部不能还有 dispatch 的操作 dispatch 触发 reducer reducer 又触发 dispatch ...堆栈溢出啦 大哥**

```javascript
function dispatch(action) {
  //action必须是对象
  if (!isPlainObject(action)) {
    throw new Error(
      "Actions must be plain objects. " +
        "Use custom middleware for async actions."
    );
  }
  //action必须有一个type属性
  if (typeof action.type === "undefined") {
    throw new Error(
      'Actions may not have an undefined "type" property. ' +
        "Have you misspelled a constant?"
    );
  }

  //reducer内部不能有dispatch的操作 不然的话会进行循环调用
  // 相当于 dispatch（） - reducer() - dispatch（）......
  if (isDispatching) {
    throw new Error("Reducers may not dispatch actions.");
  }

  try {
    //isDispatching置为true 说明已经处于dispatch状态了
    isDispatching = true;
    //执行reducer 获取state
    currentState = currentReducer(currentState, action);
  } finally {
    //结束后置为false
    isDispatching = false;
  }
  //这里的作用还是用于更新同步监听器
  const listeners = (currentListeners = nextListeners);
  //执行listeners里面的订阅函数
  for (let i = 0; i < listeners.length; i++) {
    const listener = listeners[i];
    listener();
  }

  return action;
}
```

## 订阅 subscribe

subscribe 就是添加订阅者的一个方法 执行完成之后返回的函数是解绑的方法 其中要注意的一点就是 ensureCanMutateNextListeners 方法的作用 至于为什么要使用两个监听器数组 nextListeners 和 currentListeners 就是为了同步循环中当前监听器数组和真实监听器数组的长度（防止绑定过程冲解绑造成索引值发生变化）

```javascript
// const unsubscribe = store.subscribe(() =>
//   console.log(store.getState())
// )
//其中 执行后的返回值是注销监听器
function subscribe(listener) {
  //再推入新的订阅者前  先更新拷贝的监听器数组nextListeners
  ensureCanMutateNextListeners();
  nextListeners.push(listener);

  return function unsubscribe() {
    //删除之前再次更新拷贝的监听器数组nextListeners 确保当前的监听器函数是最新的
    ensureCanMutateNextListeners();
    /*ensureCanMutateNextListeners函数的作用就是更新同步当前最新的订阅器和当前的订阅器
      * 使用currentListeners作为删除和添加的数组
      * 就是比如我在订阅的函数中进行注销另外的监听器 类似于
      * const unsubscribe1 = store.subscribe(() =>{})
      * const unsubscribe2 = store.subscribe(() =>{ unsubscribe1() })
      * const unsubscribe3 = store.subscribe(() =>{})
      *  执行dispatch(action) 在循环的过程中
      *for (let i = 0; i < listeners.length; i++) {
      *  const listener = listeners[i];
      *  listener(); 执行到unsubscribe2的过程中 listener的长度发生了变化减少了1 那么就会造成跳过下一个订阅
      *}
      * 所以需要拷贝一个真正的监听器函数组 每次进行解绑时  都把当前的监听器函数与最新的监听器函数进行同步
      * 因为在订阅第二个函数的过程中 我进行了unsubscribe1的解绑操作
      * 那么currentListeners数组的索引值也发生了改变 所以需要一个拷贝来真正同步真正的订阅器数组
      * */
    const index = nextListeners.indexOf(listener);
    nextListeners.splice(index, 1);
  };
}
//replaceReducer一般用于开发环境下的热更新
function replaceReducer(nextReducer) {
  if (typeof nextReducer !== "function") {
    throw new Error("Expected the nextReducer to be a function.");
  }

  currentReducer = nextReducer;
  dispatch({ type: ActionTypes.REPLACE });
}
```

## 总结
总而言之 createStore 就是一个简单的发布订阅函数（applyMiddleware 用于增强这个函数）,接下来分析一波合成子 reducer 的 combineReducer 函数
