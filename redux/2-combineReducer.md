## 前言

>在阅读源码的过程中我也翻阅了大量的资料。一般是先去看别人的源码分析完完整镇过的读一遍之后，看完了之后自己再把官网的clone下来自己再慢慢的阅读添加注释。希望大家在阅读完有感想之后也把官网源码clone下来不照着任何的资料边写注释边阅读完全部源码，这样子更有利于深刻理解。


**在工作中其实会经常使用到 redux 数据状态处理库，在一开始的使用中就一直听到说 reducer 必须是一个纯函数，不能有副作用!state 需要有一个默认值!等等的约束。当然也踩过含有副作用修改了 state 造成视图层不更新的 bug(state 嵌套过深的锅。。。) 一直停留在知其然不知其所以然的层次 想到彻底的掌握以及明白 redux 的原理的办法当然就是直接阅读源码啦 而且 redux 非常简洁才 2kb 而已= = 非常值得一读**

> 最开始我们分析 createStore 函数的源码，接下来还有一个 api 我们会经常使用到就是 combineReducer，用于把多个分模块的子 reducer 生成一个总的 reducer

## combineReducers 的基本使用

```javascript
//常用的三个api
import { createStore, combineReducers, applyMiddleware } from "redux";

import { userReducer } from "./user/reducer";
import { todoReducer } from "./todo/reducer";
//combineReducers用于合并多个子reducer生成一个总的reducer
const reducers = combineReducers({
  userStore: userReducer,
  todoStore: todoReducer
});
```

> 明白了 combineReducers 的基本用法之后我们就可以深入源码啦

上源码，为了减小篇幅，我删减了很多没用的代码（包括一些错误边界处理，其实很多错误边界处理都很有意思），如果想看完整的redux代码注释的话可以点击[**这里**](https://github.com/carrot-wu/Learn-Redux-Ecosystem "Markdown")。

## combineReducers

通过源码 我们可以看到 combineReducers 其实接受要合并的 reducer 对象 返回 combination 函数 其实 combination 还是一个 reducer dispatch（action）的时候 会依次调用子 reducer 计算出子 reducer 的 state 值再而合并成对象。

- **combineReducers 一开始会循环所有的子 reducer 筛选出可用的 reducer(state 不能为 underfined 子 reducer 在 redux 内部自定义 action 的时候必须返回默认值 state)并且生成真正可用的 finalReducers**
- **dispatch（action）的时候 会循环所有的子 reducer 传入 action 依次生成新的子 state 值 之后浅比较之前的 state 和新生成的 state 如果浅比较不相同就把 hasChanged 赋值为 true 证明子 state 改变了自然而然总 state 也改变了**
- **combination 在返回 state 值时会进行判断 判断当前的 hasChanged 是否为 true 是的话证明 state 发生了变化返回新的 state 不然 state 没有变化返回旧的 state 值**

```javascript
export default function combineReducers(reducers) {
  //获取所有子reducers的key值
  const reducerKeys = Object.keys(reducers);
  //筛选后可用的reducers
  const finalReducers = {};
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];
    /*
    * 开发环境下下遍历所有子reducers的value值
    * 如果value为undefined 抛出警告
    * 即 combineReducers({a:aReducer,b:bReducer}) 中的aReducer 不能为underfined
    * */
    if (process.env.NODE_ENV !== "production") {
      if (typeof reducers[key] === "undefined") {
        warning(`No reducer provided for key "${key}"`);
      }
    }

    //进行筛选 筛选出函数类型的reducer
    if (typeof reducers[key] === "function") {
      finalReducers[key] = reducers[key];
    }
  }
  const finalReducerKeys = Object.keys(finalReducers);

  let shapeAssertionError;
  try {
    //assertReducerShape是一个错误处理函数
    //判断子reducer在传入一个非预定好的action时 是否会返回默认的state
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }

  return function combination(state = {}, action) {
    //state是否改变 这里判断state是否改变是通过浅比较的
    // 所以才要求每次返回的state都是一个全新的对象
    let hasChanged = false;
    //新的state值 这里的state是根rootReducer的state
    const nextState = {};
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      //根据key值获取相当应的子reducer
      const reducer = finalReducers[key];
      //获取上一次当前key值所对应的state值 下面要进行浅比较
      const previousStateForKey = state[key];
      //获取传入action之后新生成的state值
      const nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === "undefined") {
        const errorMessage = getUndefinedStateErrorMessage(key, action);
        throw new Error(errorMessage);
      }
      //循环执行reducer 把新的值进行存储
      nextState[key] = nextStateForKey;
      //浅比较  
      // 这里把旧的子reducer state值与传入action之后生成的state值进行浅比较 判断state是否改变了
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    //根据判断赶回state   只要有一个子reducer hasChanged为true那么就重新返回新的nextState
    // 所以这里揭示了为什么reducer必须是纯函数而且如果state改变了必须返回一个新的对象
    //如果返回的是旧的state对象（有副作用的push，pop方法）
    // 如果state是对象 因为nextStateForKey !== previousStateForKey比较的是引用
    // 那么 hasChanged认为是false没有发生改变 自然而然下面返回的state依然是旧的state
    return hasChanged ? nextState : state;
  };
}

function assertReducerShape(reducers) {
  Object.keys(reducers).forEach(key => {
    //遍历reducer
    const reducer = reducers[key];
    //先依次执行reducer 看是否有默认返回值state 其中ActionTypes.INIT为内部自定义的action
    // 自然而然的执行到default 如果返回undefined 抛出错误 state要有默认值
    const initialState = reducer(undefined, { type: ActionTypes.INIT });

    if (typeof initialState === "undefined") {
      throw new Error(
        `Reducer "${key}" returned undefined during initialization. ` +
          `If the state passed to the reducer is undefined, you must ` +
          `explicitly return the initial state. The initial state may ` +
          `not be undefined. If you don't want to set a value for this reducer, ` +
          `you can use null instead of undefined.`
      );
    }
    if (
      typeof reducer(undefined, {
        type: ActionTypes.PROBE_UNKNOWN_ACTION()
      }) === "undefined"
    ) {
      throw new Error(
        `Reducer "${key}" returned undefined when probed with a random type. ` +
          `Don't try to handle ${
            ActionTypes.INIT
          } or other actions in "redux/*" ` +
          `namespace. They are considered private. Instead, you must return the ` +
          `current state for any unknown actions, unless it is undefined, ` +
          `in which case you must return the initial state, regardless of the ` +
          `action type. The initial state may not be undefined, but can be null.`
      );
    }
  });
}
```
## 总结
combineReducers的返回值实质上就是一个reducer函数，这个返回的reducer函数会把action传入各个子reducer中获取子state然后进行合并。
