var debounce = function (fn, delay) {
  var _arguments = Array.prototype.slice.call(arguments, 2) //获取参入的参数
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


var throttle = function (fn, delay) {
  var _arguments = Array.prototype.slice.call(arguments, 2) //获取参入的参数
  var timer = null
  return function () {
    var that = this
    if(timer) return false
    timer = setTimeout(function () {
      fn && fn.apply(that, fnArgs)
    }, delay)

  }
}

// apply 和 call 的兼容
// 原理其实是用过隐形绑定 对象调用的方法来设置this的指向 所以要把传入的this设置为对象这样子进行调用

Function.prototype.myApply = function(context,args = []){
  //注意的是如果传入的是undefined或者null 都是不绑定this 用自身的this
  let targetContext = (context === void 0 || context === 'null') ? this : context
  targetContext = new Object(targetContext)
  //设置对象 这里为了防止使用对象的key值 可以使用symbol
  const targetKey = '___keys___'
  targetContext[targetKey] = this
  const result =  targetContext[targetKey](...args)
  delete targetContext[targetKey]
  return result
}

//var a = b.bind(this,参数)
Function.prototype.myBind = function(context){
  //这里的this就是b函数
  var that = this
  var _args = Array.prototype.slice.call(arguments,1)
  var _fun = function(){
    var args = _args.concat(Array.prototype.slice.call(arguments))
    return that.apply( this instanceof _fun ? this : context,args)
    //判断当前函数里的this是否为当前函数的实例
  }
  return _fun
}
//var c = new a()

// new 的模拟实现
// var a = b.MyNew(参数)
Object.prototype.MyNew = function(){
  var obj = {}
  obj.__proto__ = this.prototype
  var result = this.apply(obj,Array.prototype.slice.call(arguments))
  return typeof result === 'object' ? result : obj
}

//数组扁平化
Array.prototype.flatten = function(){
  return this.reduce(function(prev,cur){
    if( Array.isArray(cur) ){
      prev = prev.concat(cur.flatten())
    }else{
      prev.push(cur)
    }
    return prev
  },[])
}
console.log([1,2,3,[122,12,[12],[4,5,6]],[12,[13,[14]]]].flatten())

//函数柯丽化
function curry(fn,setArray){
  var _setArray = setArray || []
  if(!Array.isArray(_setArray)){
    throw new Error('参数必须为数组')
  }
  var length = fn.length
  return function(){
    var _args = _setArray.concat(Array.prototype.slice.call(arguments))
    if(_args.length >= length){
      return fn.apply(this,_args)
    }else{
      return curry(fn,_args)
    }
  }
}

var add = function(a,b,c){
  return a+b+c
}
var curryAdd = curry(add)
console.log(curryAdd(1)(2)(3))
console.log(curryAdd(1,2)(3))
console.log(curryAdd(1,2))
//
function lazyLoad(selector){
  const imgSelector = document.querySelectorAll(selector)
  let num = 0
  //这里的num作用是获知当前前num涨图片已经展示完毕了 不必要每次都重头开始展示
  //获取屏幕高度
  const windowHeight = window.innerHeight || document.documentElement.clientHeight
  function _lazyLoad(){
    for (let i =num; i<imgSelector.length; i++){
      //获取当前图片元素距离顶端的距离
      let instance = windowHeight - imgSelector[i].getBoundingClientRect().top
      if(instance >=50){
        //展示图片
        imgSelector.setAttribute('src',imgSelector.getAttribute('data-src'))
        //当前图片已经展示完毕 跳转到下一张
        num +=1
      }
    }
  }
  //这里可以添加节流
  window.addEventListener('scroll',throttle(_lazyLoad,200),false)
}

//取数组最大值
function getArrayMax(array){
  return Math.max.apply(null,array)
}
/*
* 关于async await的一些理解
* 很多人以为await会一直等待之后的表达式执行完之后才会继续执行后面的代码，实际上await是一个让出线程的标志。await后面的函数会先执行一遍
* 然后就会跳出整个async函数来执行后面js栈的代码。等当前执行栈代码执行完了之后又会跳回到async函数中等待await后面表达式的返回值
* 如果返回值为非promise则继续执行async函数后面的代码，否则将返回的promise放入Promise队列（Promise的Job Queue）(等待微任务执行栈的代码执行完then之后 在当前执行栈的末尾才执行await之后的操作)
* */

// dom操作的一些遍历

//遍历某个dom接线下的所有节点树
const _length = document.querySelectorAll('body *').length

// 给点节点 打印所有出现在的标签以及出现次数 使用的标签也可以显示出来 https://github.com/shiyangzhaoa/easy-tips/blob/master/tips/dom_depth.md
const getEleObject = (node) => {
  if(!node.children.length){
    return {}
  }

  return (function test (node, parentObject = {}) {
    return Array.from(node.children).reduce((obj,cur) => {
      const eleKey = cur.tagName.toLowerCase()
      obj[eleKey] =  obj[eleKey] ? (++obj[eleKey]) : 1
      return cur.children.length ? test(cur, obj) : obj
    }, parentObject)
  })(node)
}
const body = document.querySelector('body')
getEleObject(body)

// 求dom节点的最深长度以及dom数的宽度 这里的方法是不加算字符串的深度的
const getDomDeep = (node) => {
  let maxDeep = 0
  let maxWidth = 0
  if(!node.children.length) return {maxDeep,maxWidth}
  function getLength(node,deep){
    deep +=1
    Array.from(node.children).forEach(item => {
      if(item.children.length){
        getLength(item,deep)
      }else{
        maxDeep = deep > maxDeep ? deep : maxDeep
        maxWidth += 1
      }
    })
  }
  getLength(node,0)
  return {maxDeep,maxWidth}
}

const getDomTree = (node) => {
  const treeArray = []
  if(!node.children.length) return []
  function getDom(node, parentTagName){
    Array.from(node.children).forEach(childNode => {
      const currentTreeTagName = `${parentTagName ? parentTagName : node.tagName.toLowerCase()}--${childNode.tagName.toLowerCase()}`
      if(childNode.children.length){
        getDom(childNode, currentTreeTagName)
      }else{
        treeArray.push(currentTreeTagName)
      }
    })
  }
  getDom(node)
  return treeArray
}

// 数组的乱序

function arraySplit(array){
  return array.sort(() => Math.random() > 0.5)
}
// 上面的乱序其实是不准确的 因为在chrome中对于sort方法 如果数组长度小于10 那么就用插入排序 不然就用快速排序
// 对于插入排序或者快速排序 其实有可能一半的数值都不用进行比较久确定值了
const d = function(array) {
  const length = array.length
  // （i< length ） 也可以不过在最后一个数组时也只是替换自己而且 没必要
  // 原理是从数组末尾开始 随机替换 包括自己到数组首的赋值
  for(let i =0; i< length -1;  i++){
    let index = Math.floor((length - i) * Math.random())
    const cur = array[length - (i+1)]
    array[length - (i+1)] = array[index]
    array[index] = cur
  }
  return array
}

//深拷贝
function deepCopy(object){
  var isObject = function(target){
    return (typeof(target) ==='object' && object !== null)
  }

  var _returnObject = Array.isArray(object) ? [] : {}


  if(!isObject(object)){
    throw new Error('深拷贝对象必须为数组或者对象哦')
  }
  //遍历对象
  for(var key in object){
    if(object.hasOwnProperty(key)){
      //如果key值是null的话 直接进行赋值 如果不做这一步的话会在上面直接返回一个false值
      if(object[key] === null){
        _returnObject[key] = object[key]
      }else if(isObject( object[key] )){
        //递归调用自身
        _returnObject[key] = deepCopy(object[key])
      }
      else{
        _returnObject[key] = object[key]
      }
    }
  }
  return _returnObject
}
var test = [null,2,[3,undefined,5,[1]],{key:null,value:2},'123',function(){console.log(2)},false]
var testObject = deepCopy(test)
test[1] = 'test'
test[2][0] = 'test'
test[2][3].push('test')
test[3].key = 'test'
test[5] = '1111'
console.log(testObject)

//lazyman

class LazyMan{
  constructor(name){
    this.name = name
    this.task = []

    let consoleName = () =>{
      console.log(`i am lazyName ${this.name}`)
      this.next()
    }
    this.task.push(consoleName)
    setTimeout(() =>{
      console.log('start')
      this.next()
    },0)

  }
  sleep(time){

    let _sleep = () =>{

      setTimeout(() =>{
        console.log(`${this.name} sleep ${time} alearady`)
        this.next()
      },time*1000)
    }

    this.task.push(_sleep)
    return this
  }
  eat(data){
    let _eat = () =>{
      console.log(`${this.name}eat${data}`)
      this.next()
    }
    this.task.push(_eat)
    return this
  }
  next(){
    //每次执行完一个任务获取下一个任务 并且去除一开始的任务
    let nextTask = this.task.shift()

    //console.log(nextTask)
    nextTask && nextTask()
  }
}

let man =  new LazyMan('wuhr')
man.sleep(0.5).eat('fan').sleep(4).eat('zhopu')
