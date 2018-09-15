/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

/*
* compose（高阶函数） 返回一个把传入的中间件数组从右到左依次执行的函数
*
* */
export default function compose (...funcs) {
  //如果没有传入中间件 直接把原始的store.dispatch函数返回出去
  if (funcs.length === 0) {
    return arg => arg
  }
//传入一个中间件 直接返回这个中间件函数
  if (funcs.length === 1) {
    return funcs[0]
  }
  // 最重要的部分 传入两个或以上的时候 这个函数相当于
  //previousFun 上一个中间件 currentFun 当前中间件
  /*
    funcs.reduce(function(previousFun,currentFun){
      return function(...args){
        //依次从右到左调用中间件 把右边的中间件的执行返回值作为参数传入下一个中间件中
        const rightFunResult = currentFun(...args)
        return previousFun(rightFunResult)
      }
    })
  */
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}