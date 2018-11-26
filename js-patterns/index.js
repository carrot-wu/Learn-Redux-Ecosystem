/*
* 设计模式的总结
* */

/*
* 单例模式
* */
class single {
  constructor (name) {
    this.name = name
  }

  tellName () {
    console.log(this.name)
  }

  static getInstance () {
    if (!single._instance) {
      single._instance = new single('hh')
    }
    return single._instance
  }
}

/*策略模式*/
//之后对于一些需要判断ifelse的操作其实都可以通过策略模式来实现 这样子的话对于后期的维护也是十分的简单
//其实就是把不同的操作通过对象的key值来获取 而不是通过switch 或者 if else来实现 有点类似于状态机
//假设一个状态机有4个状态 0关闭  1付款中  2已付款  3已取消
const status = {
  0: () => {
    console.log('close')
  },
  1: () => {
    console.log('paying')
  },
  2: () => {
    console.log('paid')
  },
  3: () => {
    console.log('cancel')
  }
}

/* 观察者模式*/

//其实就是类似于 jquery里面的on方法
class eventEmitter {
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

/*适配器模式*/
//不同国家的插头不通用可以用一个适配器进行适配
//其实这个地方一般常用于重构老方法的依赖包 但是老方法的api调用又暂时无法测地抛弃掉的时候 比如老版本我用了jquery的 $.ajax 这时候重构掉抛弃了jquery 可以重写$.ajax方法进行适配

/*工厂模式*/

//把重复性的操作进行封装 比如创建一些类似的对象
function createObject (type) {
  switch (type) {
    case '1':
      return { type, name: 'object' }
    default:
      return []
  }
}

/*代理模式*/
//可以把分模块的api请求 共同引用到一个api文件中 这样子所有的请求都可以引入这个api文件进行条用

/*装饰器模式*/
//钢铁写知道吧 基本就是人 但是可以铁架不同的功能进行增强功能 原理就是装饰器模式 其实就是类似于类的继承进行添加实例方法或者重写方法
//es7的装饰器函数其实可以写啊 function(target,name,descortor)
