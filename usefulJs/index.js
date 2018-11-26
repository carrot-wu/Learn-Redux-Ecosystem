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
    for (let i =num;i<imgSelector.length;i++){
      //获取当前图片元素距离顶端的距离
      let instance = windowHeight - imgSelector[i].getBoundingClientRect.top()
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

