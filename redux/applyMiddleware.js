import compose from './compose'

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
//applyMiddleware的主要作用就是增强redux的dispatch方法（或者说重新构造dispatch）调用了applyMiddleware的dispatch
//这里的代码还是简化一下 还记得我们怎么使用中间件的吗 const store = createStore(reducer,applyMiddleware(middleware))
//applyMiddleware接受多个中间件 执行之后返回一个函数 这个函数接受createStore作为参数 返回的话是一个增强版的store
//使用了中间件的createStore写法     return enhancer(createStore)(reducer, preloadedState) 相当于applyMiddleware(middleware)(createStore)(reducer, preloadedState)
//
/*
export default function  applyMiddleware(...middlewares) {
  return function(createStore){
    return function(...args){
      const store = createStore(...args)
        ...
    }
  }
}
*/
export default function applyMiddleware (...middlewares) {
  return createStore => (...args) => {
    //根据传入的reducer, preloadedState生成一个增强班的store 看上面22行
    const store = createStore(...args)

    //这里开始 原来源码解析发生了变化 好像跟2016年的不一样 原来的dispatch = store.dispatch
    //https://github.com/reduxjs/redux/issues/1240 当前issues的讨论 大概就是 在初始化middleware的过程中 执行store.dispatch的话 此时的dispatch不是经过增强的dispatch 会造成之后的中间件也无法正常执行
    let dispatch = () => {
      //初始化调用dispatch 抛出错误 这时候的dispatch还是原始的dispatch（store.dispatch）
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
        `Other middleware would not be applied to this dispatch.`
      )
    }

    const middlewareAPI = {
      getState: store.getState,
      //这里的dispatch是原始的store dispatch 至于包多一层函数 是因为dispatch会传入每一个中间件中 要是不用函数抱着的话 要是有一个中间件认为的修改了dispatch方法的引用 那么全部的中间件传入的dispatch也被修改了
      dispatch: (...args) => dispatch(...args)
    }
    //执行每个中间件 生成闭包 传入middlewareAPI参数  这样子每个中间件都可以使用getState 和 dispatch方法
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    //compose方法 从右到左依次执行中间件的函数
    /*
    *  const chainFn = compose(...chain) 返回一个从右到左依次执行中间件的函数 可以去查看compose文件的注释
    *   dispatch = chainFn(store.dispatch) 执行这个返回的函数 传入store.dispatch函数
    * */
    dispatch = compose(...chain)(store.dispatch)

    //这样子的dispatch就是增强过后的dispatch方法接下来  查看是如何使用redux-thunk中间件来增强的
    return {
      ...store,
      dispatch
    }
  }
}

//redux-thunk源码 applyMiddleware(reduxThunk())
function reduxThunk (extraArgument) {
  //reduxThunk()执行完成之后返回一个函数 函数接受一个对象 还记得上面的const chain = middlewares.map(middleware => middleware(middlewareAPI))吗
  //这里的{ dispatch, getState }就是传入执行的middlewareAPI 其中next就是上一层的中间件函数
  //applyMiddleware内部又执行了一次传入的中间件并且传入了这个middlewareAPI对象 又返回了一个高阶函数 const hoc = (next) => action =>{}
  //dispatch = compose(...chain)(store.dispatch) 中的store.disptch就是传入的next回调函数 执行完之后又返回一个函数 (action) =>{ next(action) } 其中的next变成了store.patch
  //这个(action) =>{ next(action) } 会当做回调函数再次传给左边的中间件的next参数 这个回调函数就变成左边中间件的next 就这样依次嵌套形成了洋葱模型
  //最终返回的增强版dispatch方法 就是类似于这样的一个函数
/*
  (action) =>{
  先对action进行处理
  //遇到next(action) 就是下一个中间的回调 把这个action交给下一个中间件执行 依次调用
  next(action)
  //下一个中间执行完之后 又可以做一些事情
    }
*/
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument)
    }
    return next(action)
  }
}



