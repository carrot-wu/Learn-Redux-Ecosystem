
## 函数抖动

一定时间内连续触发事件不会执行
```javascript
/**
 *
 * @param fn 抖动函数
 * @param delay 延迟多少毫秒执行
 * @returns {Function}
 */
var debounce = function (fn, delay) {
  //获取参入的参数
  var _arguments = Array.prototype.slice.call(arguments, 2) 
  var timer = null
  return function () {
    var that = this
    var fnArgs = _arguments.concat(Array.prototype.slice.call(arguments))
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn && fn.apply(that, fnArgs)
    }, delay)
  }
}
```

## 函数节流

```javascript
/**
 * 按给定的时间延迟执行一次事件
 * @param fn 抖动函数
 * @param delay 延迟多少毫秒执行
 * @returns {Function}
 */
var throttle = function (fn, delay) {
   //获取参入的参数
  var _arguments = Array.prototype.slice.call(arguments, 2)
  var timer = null
  return function () {
    var that = this
    var fnArgs = _arguments.concat(Array.prototype.slice.call(arguments))
    if (timer) return false
    timer = setTimeout(function () {
      fn && fn.apply(that, fnArgs)
    }, delay)

  }
}
```

## apply和call的模拟实现

```javascript
/**
 * apply的模拟实现， call类似
 * @param context 被修改的this指向
 * @param args 传入的参数
 * @returns {*}
 */

// 原理其实是用过隐形绑定 对象调用的方法来设置this的指向
// 所以要把传入的this设置为对象这样子进行调用
Function.prototype.myApply = function (context, args = []) {
  //注意的是如果传入的是undefined或者null 都是不绑定this 用自身的this
  let targetContext = (context === void 0 || context === 'null') ? this : context
  targetContext = new Object(targetContext)
  //设置对象 这里为了防止使用对象的key值 可以使用symbol
  const targetKey = '___keys___'
  targetContext[targetKey] = this
  const result = targetContext[targetKey](...args)
  delete targetContext[targetKey]
  return result
}
```

## bind的模拟实现
```javascript
//var a = b.bind(this,参数)
/**
 *  bind的模拟实现
 * @param context 修改的this执行
 * @returns {function(): *}
 */
Function.prototype.myBind = function (context) {
  //这里的this就是b函数
  var that = this
  var _args = Array.prototype.slice.call(arguments, 1)
  var _fun = function () {
    var args = _args.concat(Array.prototype.slice.call(arguments))
    return that.apply(this instanceof _fun ? this : context, args)
    //判断当前函数里的this是否为当前函数的实例
  }
  return _fun
}

```

## new的模拟实现
```javascript
// new 的模拟实现
// var a = b.MyNew(参数)
/**
 *
 * @returns {*}
 * @constructor 返回的实例
 */
Object.prototype.MyNew = function () {
  var obj = {}
  obj.__proto__ = this.prototype
  var result = this.apply(obj, Array.prototype.slice.call(arguments))
  return typeof result === 'object' ? result : obj
}
```

## 数组扁平化
```javascript
//数组扁平化
Array.prototype.flatten = function () {
  return this.reduce(function (prev, cur) {
    if (Array.isArray(cur)) {
      prev = prev.concat(cur.flatten())
    } else {
      prev.push(cur)
    }
    return prev
  }, [])
}
console.log([1, 2, 3, [122, 12, [12], [4, 5, 6]], [12, [13, [14]]]].flatten())

```

## 函数柯丽化
```javascript
//函数柯丽化
/**
 *
 * @param fn 需要柯丽化的函数
 * @param setArray 传参数组集合
 * @returns {Function}
 */
function curry (fn, setArray) {
  var _setArray = setArray || []
  if (!Array.isArray(_setArray)) {
    throw new Error('参数必须为数组')
  }
  var length = fn.length
  return function () {
    var _args = _setArray.concat(Array.prototype.slice.call(arguments))
    if (_args.length >= length) {
      return fn.apply(this, _args)
    } else {
      return curry(fn, _args)
    }
  }
}

var add = function (a, b, c) {
  return a + b + c
}
var curryAdd = curry(add)
console.log(curryAdd(1)(2)(3))
console.log(curryAdd(1, 2)(3))
console.log(curryAdd(1, 2))

```
## compose方法

```javascript
// compose 方法 摘自redux中的源码
/**
 *
 * @param fns 需要依次执行的函数数组
 * @returns {*|(function(*): *)} 返回执行compose的函数
 */
function compose (...fns) {
  if (fns.length === 0) {
    return args => args
  }
  if (fns.length === 1) {
    return fns[0]
  }
  return fns.reduce((prev, cur) => {
    return (...args) => {
      const rightResult = prev(...args)
      return cur(rightResult)
    }
  })
  // return fns.reduce((prev, cur) => (...args) => prev(cur(...args)))
}
/*
// 如果设置中间件的话 传入的函数必须为这样的格式

function createMiddleware(text) {
  return function middleware(next) {
    // next 为上一个中间的执行回调返回的函数
    // 这里是中间件的初始执行
    // 就是洋葱进入的过程
    console.log(`${text}我进来啦hhhh`)
    // 其中返回的函数就是回调函数
    return function(args) {
      // 这里是洋葱模型返回出去的执行过程
      // 调用next的话 就是调用上一层中间的回调return方法
      console.log(`${text}我出去啦 hhhhhh`)
      return next()
    }
  }
}
// 如果要做中间件 还得把第一个函数进行处理 一般可以直接放进去compose内部
const firstMiddleware = function(next){
  return next()
}
const middlewre1 = createMiddleware('1111')
const middlewre2 = createMiddleware('2222')
const testCompose = compose( middlewre1, middlewre2,firstMiddleware)
testCompose(() => {console.log('first')})
*/
```

## 原生图片懒加载方法
```javascript
//懒加载
/**
 * 原生懒加载效果
 * @param selector 需要懒加载的图片类名
 * @param distance 距离底部多少距离是进行加载图片
 */
function lazyLoad (selector, distance = 50) {
  const imgSelector = document.querySelectorAll(selector)
  let num = 0
  //这里的num作用是获知当前前num涨图片已经展示完毕了 不必要每次都重头开始展示
  //获取屏幕高度
  const windowHeight = window.innerHeight || document.documentElement.clientHeight

  function _lazyLoad () {
    for (let i = num; i < imgSelector.length; i++) {
      //获取当前图片元素距离顶端的距离
      let instance = windowHeight - imgSelector[i].getBoundingClientRect().top
      if (instance >= distance) {
        //展示图片
        imgSelector.setAttribute('src', imgSelector.getAttribute('data-src'))
        //当前图片已经展示完毕 跳转到下一张
        num += 1
      }
    }
  }
  //这里可以添加节流
  window.addEventListener('scroll', throttle(_lazyLoad, 200), false)
}
```

## 取数组最大值方法
```javascript
//取数组最大值
/**
 * @param array 数组
 * @returns {number} 最大的数字
 */
function getArrayMax (array) {
  return Math.max.apply(null, array)
}
```


## 遍历某个dom节点下的所有节点树
```javascript
const _length = document.querySelectorAll('body *').length

// 给定节点 打印所有出现在的标签以及出现次数 使用的标签也可以显示出来 https://github.com/shiyangzhaoa/easy-tips/blob/master/tips/dom_depth.md
/**
 *
 * @param node dom节点
 * @returns {{}|unknown} 返回的节点树对象
 */
const getEleObject = (node) => {
  if (!node.children.length) {
    return {}
  }
  return (function getDomTree (node, parentObject = {}) {
    return Array.from(node.children).reduce((obj, cur) => {
      const eleKey = cur.tagName.toLowerCase()
      obj[eleKey] = obj[eleKey] ? (++obj[eleKey]) : 1
      return cur.children.length ? getDomTree(cur, obj) : obj
    }, parentObject)
  })(node)
}
const body = document.querySelector('body')
getEleObject(body)
```

## 求dom节点最深和最宽
```javascript
// 求dom节点的最深长度以及dom数的宽度 这里的方法是不加算字符串的深度的
const getDomDeep = (node) => {
  let maxDeep = 0
  let maxWidth = 0
  if (!node.children.length) return { maxDeep, maxWidth }
  function getLength (node, deep) {
    deep += 1
    Array.from(node.children).forEach(item => {
      if (item.children.length) {
        getLength(item, deep)
      } else {
        maxDeep = deep > maxDeep ? deep : maxDeep
        maxWidth += 1
      }
    })
  }
  getLength(node, 0)
  return { maxDeep, maxWidth }
}

```

## 获取dom节点所有分支数
```javascript
/**
 * 获取dom节点的所有分支
 * @param node dom节点
 * @returns {[]|Array} 标签名分支数组
 */
const getDomTree = (node) => {
  const treeArray = []
  if (!node.children.length) return []
  
  function getDom (node, parentTagName) {
    Array.from(node.children).forEach(childNode => {
      const currentTreeTagName = `${parentTagName ? parentTagName : node.tagName.toLowerCase()}--${childNode.tagName.toLowerCase()}`
      if (childNode.children.length) {
        getDom(childNode, currentTreeTagName)
      } else {
        treeArray.push(currentTreeTagName)
      }
    })
  }

  getDom(node)
  return treeArray
}

```

## 数组乱序（错误版以及正确版）
```javascript
// 数组的乱序

function arraySplit (array) {
  return array.sort(() => Math.random() > 0.5)
}
// 上面的乱序其实是不准确的 因为在chrome中对于sort方法
// 如果数组长度小于10 那么就用插入排序 不然就用快速排序
// 对于插入排序或者快速排序 其实有可能一半的数值都不用进行比较就确定值了

// 参考洗牌算法才是真正的乱序
const d = function (array) {
  const length = array.length
  // （i< length ） 也可以不过在最后一个数组时也只是替换自己而且 没必要
  // 原理是从数组末尾开始 随机替换 包括自己到数组首的赋值
  for (let i = 0; i < length - 1; i++) {
    let index = Math.floor((length - i) * Math.random())
    const cur = array[length - (i + 1)]
    // 调换两值
    array[length - (i + 1)] = array[index]
    array[index] = cur
  }
  return array
}
```

## 简易的深拷贝
```javascript
/**
 *
 * @param object 深拷贝对象
 * @returns {[]}
 */
function deepCopy (object) {
  var isObject = function (target) {
    return (typeof (target) === 'object' && object !== null)
  }
  var _returnObject = Array.isArray(object) ? [] : {}
  if (!isObject(object)) {
    throw new Error('深拷贝对象必须为数组或者对象哦')
  }
  //遍历对象
  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      //如果key值是null的话 直接进行赋值
      // 如果不做这一步的话会在上面直接返回一个false值
      if (object[key] === null) {
        _returnObject[key] = object[key]
      } else if (isObject(object[key])) {
        //递归调用自身
        _returnObject[key] = deepCopy(object[key])
      } else {
        _returnObject[key] = object[key]
      }
    }
  }
  return _returnObject
}

var test = [null, 2, [3, undefined, 5, [1]], { key: null, value: 2 }, '123', function () {console.log(2)}, false]
var testObject = deepCopy(test)
test[1] = 'test'
test[2][0] = 'test'
test[2][3].push('test')
test[3].key = 'test'
test[5] = '1111'
console.log(testObject)
```

## lazyman
```javascript
class LazyMan {
  constructor (name) {
    this.name = name
    this.task = []
    let consoleName = () => {
      console.log(`i am lazyName ${this.name}`)
      this.next()
    }
    this.task.push(consoleName)
    setTimeout(() => {
      console.log('start')
      this.next()
    }, 0)
  }

  sleep (time) {
    let _sleep = () => {
      setTimeout(() => {
        console.log(`${this.name} sleep ${time} alearady`)
        this.next()
      }, time * 1000)
    }
    this.task.push(_sleep)
    return this
  }

  eat (data) {
    let _eat = () => {
      console.log(`${this.name}eat${data}`)
      this.next()
    }
    this.task.push(_eat)
    return this
  }

  next () {
    //每次执行完一个任务获取下一个任务 并且去除一开始的任务
    let nextTask = this.task.shift()
    //console.log(nextTask)
    nextTask && nextTask()
  }
}

let man = new LazyMan('wuhr')
man.sleep(0.5).eat('fan').sleep(4).eat('zhopu')

```

## 实现一个eventEmitter
```javascript
//实现一个eventEmitter
class EventEmitter {
  constructor (maxLength = 10) {
    this._events = Object.create(null)
    this.maxLength = maxLength
  }

  addListners (type, cb) {
    //判断是否已经添加了这个方法了 如若添加了的话必须放进去一个数组中 超过的话直接报错
    if (this._events[type] && this._events[type].length === this.maxLength) throw new Error(`超出${this.maxLength}个监听事件限制啦`)
    this._events[type] = this._events[type] ? [...this._events[type], cb] : [cb]
  }

  emitEvents (type, ...args) {
    if (this._events[type]) {
      this._events[type].forEach((listner) => {
        listner.apply(this, args)
      })
    }
  }

  //监听一次 只触发一次就要删除
  once (type, cb) {
    //先绑定 在addListners的基础上调用之后就删除 重新声明一个函数
    function onceListners (...args) {
      cb && cb.apply(this, args)
      //调用完成之后删除这个监听器
      this.removeListner(type, onceListners)
    }
    this.addListners(type, onceListners)
  }

  removeListner (type, cb) {
    const removeTarget = this._events[type]
    if (removeTarget) {
      //如果没传cb 说明全部删除
      if (!cb) {
        this._events[type] = []
      }
      this._events[type] = this._events[type].reduce((prev, cur) => {
        if (cur !== cb) {
          prev.push(cur)
        }
        return prev
      }, [])
    }
  }

  //设置最大监听数
  setMaxListners (n = 10) {
    this.maxmaxLength = n
  }

  static getInstance (maxLength = 10) {
    if (eventEmitter._instance) {
      return eventEmitter._instance
    } else {
      eventEmitter._instance = new eventEmitter(maxLength)
      return eventEmitter._instance
    }
  }
}

const _fn = function (data) {
  console.log('once' + data)
}
const _test = eventEmitter.getInstance(3)
_test.addListners('hhh', function (data) {
  console.log('hhh111' + data, this._events)
})
_test.once('hhh1', _fn)
_test.addListners('hhh', (data) => {
  console.log('hhh222' + data)
})
_test.emitEvents('hhh', 123)
_test.emitEvents('hhh1', 123)
```

## promise 模拟实现
```javascript
// promise模拟实现 其实原理与发布订阅模式类似
class MyPromise {
  constructor (executor) {
    this.statusMap = {
      resolve: 'resolve',
      pending: 'pending',
      reject: 'reject'
    }
    this.status = this.statusMap.pending
    // 实例多次的注册then函数
    // p.then p.then 只要resolve 都会一并执行
    this.resolveFnArray = []
    this.rejectFnArray = []

    function resolve (resolveValue) {
      if (this.status === this.statusMap.pending) {
        // 延迟调用 为了后面的then先收集回调函数
        setTimeout(() => {
          this.status = this.statusMap.resolve
          this.resolveValue = resolveValue
          this.resolveFnArray.forEach(resolveFn => resolveFn && resolveFn(resolveValue))
        }, 0)
      }
    }

    function reject (rejectValue) {
      if (this.status === this.statusMap.pending) {
        setTimeout(() => {
          this.status = this.statusMap.reject
          this.rejectValue = rejectValue
          this.resolveFnArray.forEach(rejectFn => rejectFn && rejectFn(rejectValue))
        }, 0)
      }
    }

    executor(resolve, reject)
  }

  then (resolveFn, rejectFn) {
    const { status, resolveValue, rejectValue, statusMap, resolveFnArray, rejectFnArray } = this
    const { resolve, reject, pending } = statusMap
    switch (status) {
      case resolve :
        resolveFn(resolveValue)
        break
      case reject :
        rejectFn(rejectValue)
        break
      case pending :
        resolveFnArray.push(resolveFn)
        rejectFnArray.push(rejectFn)
        break
      default :
    }
    // p.then.then
    // 最后需要返回一个promise实例 来实现链式调用的this
    return this
  }
}
```
## 大数相加方法（只允许字符串）
```javascript
/**
 * 计算大数相加值
 * @param stringArray 大数数组
 * @returns {string}
 */
function bigNumSum (...stringArray) {
  if (stringArray.length === 1) {
    return stringArray.join('')
  }

  function getZero (length) {
    return Array.from({ length }).fill('0').join('')
  }

  // 获取数组最大的位数长度
  const maxStringLength = Math.max.apply(null, stringArray.map(stringNum => stringNum.length))
  // 给数组平整位数
  const fillStringArray = stringArray.map(stringNum => {
    const fillLength = Math.abs(maxStringLength - stringNum.length)
    return getZero(fillLength) + stringNum
  })
  console.log(maxStringLength)
  // 处理完毕 接下来进行计算
  // 用一个数组来保存 相加的位数
  const totalArray = []
  // 是否进一 大于10的话 默认为0
  let isUpperOne = 0
  // 获取index值的相加和
  function getLengthResult (index) {
    return fillStringArray.reduce((prev, cur) => prev + Number(cur[index]), 0)
  }
  for (let i = fillStringArray[0].length; i > 0; i--) {
    // 求数组的相加值
    const result = isUpperOne + getLengthResult(i - 1)
    if (result >= 10) {
      // 大于10 进位数 除以10 向下取整
      isUpperOne = Math.floor(result / 10)
    } else {
      // 小于10
      isUpperOne = 0
    }
    // 求余数
    const pushResult = result >= 10 ? (result % 10) : result
    totalArray.unshift(pushResult)
  }
  // 循环结束之后 对于首位的进为直接添加
  isUpperOne > 0 && totalArray.unshift(isUpperOne)
  return totalArray.join('')
}

const __test = bigNumSum('9111111111111119', '922222222222222222219', '9321111111113213119', '9213123123119')
```

## 正则表达式获取url的query参数
```javascript
/*
* 正则表达式获取url query
*
* */
let b = 'http:www.baidu.com/index?name=username&age=27&pwd=zbc|123@&likes=lol&likes=beautifull girl&c=&d='
const c = b.match(/([?&])([^?&#]+=[^&#]*)/g).reduce((obj, item) => {
    const [key, value] = item.slice(1).split('=')
    const prevValue = obj[key]
    obj[key] = prevValue ? (Array.isArray(prevValue) ? [...prevValue, value] : [value, prevValue]) : value
    return obj
  },
  {}
)
```

## 任务调度器（头条面试题）
```javascript
/* 任务调度器*/
class Scheduler {
  constructor() {
    this.schedulerArray = []
    Promise.resolve().then(() => {
      this.next()
      this.next()
    })
  }
  add(promiseCreator) {
    return new Promise((resolve, reject) => {
      const _promiseCreator = () => {
        return promiseCreator().then(() => {
          this.next()
          resolve()
        })
      }
      this.schedulerArray.push(_promiseCreator)
    })

  }
  next(){
    const nextScheduler = this.schedulerArray.shift()
    nextScheduler && nextScheduler()
  }
  // ...
}

const timeout = (time) => new Promise(resolve => {
  setTimeout(resolve, time)
})

const scheduler = new Scheduler()
const addTask = (time, order) => {
  scheduler.add(() => timeout(time))
    .then((...args) => console.log(args))
}

addTask(1000, '1')
addTask(500, '2')
addTask(300, '3')
addTask(400, '4')
```