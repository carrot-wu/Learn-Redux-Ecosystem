# 前言

**在工作中其实会经常使用到 redux 数据状态处理库，在一开始的使用中就一直听到说 reducer 必须是一个纯函数，不能有副作用!state 需要有一个默认值!等等的约束。当然也踩过含有副作用修改了 state 造成视图层不更新的 bug(state 嵌套过深的锅。。。) 一直停留在知其然不知其所以然的层次 想到彻底的掌握以及明白 redux 的原理的办法当然就是直接阅读源码啦 而且 redux 非常简洁才 2kb 而已= = 非常值得一读**

> 最开始我们分析createStore函数的源码，接下来还有一个api我们会经常使用到就是combineReducer，用于把多个分模块的子reducer生成一个总的reducer

# combineReducers 的基本使用

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

> 明白了 combineReducers 的基本用法之后我们就可以深入源码啦

# createStore

上源码，为了减小篇幅，我删减了很多没用的代码（包括一些错误边界处理，其实很多错误边界处理都很有意思），如果想看看的更细节的话可以去 github 去翻啦英文注释都没删除哦
通过源码 我们可以看到combineReducers其实接受要合并的reducer对象 返回combination函数 其实combination还是一个reducer dispatch（action）的时候 会依次调用子reducer计算出子reducer的state值再而合并成对象
combineReducers一开始会循环所有的子reducer 筛选出可用的reducer(state 不能为underfined  子reducer在redux内部自定义action的时候必须返回默认值state)

```javascript
export default function combineReducers(reducers) {
  //获取所有子reducers的key值
  const reducerKeys = Object.keys(reducers)
  //筛选后可用的reducers
  const finalReducers = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]
    /*
    * 开发环境下下遍历所有子reducers的value值
    * 如果value为undefined 抛出警告
    * 即 combineReducers({a:aReducer,b:bReducer}) 中的aReducer 不能为underfined
    * */
    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        warning(`No reducer provided for key "${key}"`)
      }
    }

    //进行筛选 筛选出函数类型的reducer
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }
  const finalReducerKeys = Object.keys(finalReducers)

  let unexpectedKeyCache
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {}
  }

  let shapeAssertionError
  try {
    //assertReducerShape是一个
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }

  return function combination(state = {}, action) {
    //一些错误判断处理
    if (process.env.NODE_ENV !== 'production') {
      const warningMessage = getUnexpectedStateShapeWarningMessage(
        state,
        finalReducers,
        action,
        unexpectedKeyCache
      )
      if (warningMessage) {
        warning(warningMessage)
      }
    }
    //state是否改变 这里判断state是否改变是通过浅比较的 所以才要求每次返回的state都是一个全新的对象
    let hasChanged = false
    //新的state值 这里的state是根rootReducer的state
    const nextState = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i]
      //根据key值获取相当应的子reducer
      const reducer = finalReducers[key]
      //获取上一次当前key值所对应的state值 下面要进行浅比较
      const previousStateForKey = state[key]
      //获取传入action之后新生成的state值
      const nextStateForKey = reducer(previousStateForKey, action)
      if (typeof nextStateForKey === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      //循环执行reducer 把新的值进行存储
      nextState[key] = nextStateForKey
      //浅比较  这里把旧的子reducer state值 与传入action之后生成的state值进行浅比较 判断state是否改变了
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    //根据判断赶回state   只要有一个子reducer hasChanged为true那么就重新返回新的nextState  所以这里揭示了为什么reducer必须是纯函数而且如果state改变了必须返回一个新的对象
    //如果返回的是依然的state对象（有副作用的push，pop方法）如果state是对象 因为nextStateForKey !== previousStateForKey比较的是引用 那么 hasChanged认为是false没有发生改变 自然而然下面返回的state依然是旧的state
    return hasChanged ? nextState : state
  }
}
```
