// encapsulates the subscription logic for connecting a component to the redux store, as
// well as nesting subscriptions of descendant components, so that we can ensure the
// ancestor components re-render before descendants

const CLEARED = null
const nullListeners = { notify() {} }

function createListenerCollection() {
  // the current/next pattern is copied from redux's createStore code.
  // TODO: refactor+expose that code to be reusable here?
  //嗯哼 据说要重构 还要copy redux的createStore代码？ 喵喵喵
  let current = []
  let next = []
//一个发布订阅者 。。。
  return {
    clear() {
      next = CLEARED
      current = CLEARED
    },

    notify() {
      const listeners = current = next
      for (let i = 0; i < listeners.length; i++) {
        listeners[i]()
      }
    },

    get() {
      return next
    },

    subscribe(listener) {
      let isSubscribed = true
      if (next === current) next = current.slice()
      next.push(listener)

      return function unsubscribe() {
        if (!isSubscribed || current === CLEARED) return
        isSubscribed = false

        if (next === current) next = current.slice()
        next.splice(next.indexOf(listener), 1)
      }
    }
  }
}
//这里才是关键
export default class Subscription {
  /**
   *
   * @param store provider传入的store对象
   * @param parentSub 父组件的订阅函数 如果是 根父组件的话 是null 如果是子组件connect的话就有
   * @param onStateChange connect组件的监听函数 可以查看connectAdvanced里面的onStateChange
   */
  constructor(store, parentSub, onStateChange) {
    this.store = store
    this.parentSub = parentSub
    this.onStateChange = onStateChange
    this.unsubscribe = null
    this.listeners = nullListeners
  }
  //添加子组件的渲染方法
  addNestedSub(listener) {
    this.trySubscribe()
    return this.listeners.subscribe(listener)
  }
  //执行子组件的渲染
  notifyNestedSubs() {
    this.listeners.notify()
  }

  isSubscribed() {
    return Boolean(this.unsubscribe)
  }

  //进行订阅store
  trySubscribe() {
    if (!this.unsubscribe) {
      //前面说的 判断是父组件是否已经有connect了 也就是判断是不是根节点父组件
      this.unsubscribe = this.parentSub
        //不是的话 证明是子组件connect 父组件内部有一个订阅器 把子组件的onStateChange方法丢到父组件的订阅器中 所以父组件可以再onstateChnage方法中可以派发子组件的onStateChange方法执行
        ? this.parentSub.addNestedSub(this.onStateChange)
        //是根节点父组件 那么直接订阅store
        : this.store.subscribe(this.onStateChange)
      //给每一个connect的组件在创建一个订阅器 用于该组件下又可能还有需要connect的子组件
      this.listeners = createListenerCollection()
    }
  }

  //解绑订阅器
  tryUnsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
      this.listeners.clear()
      this.listeners = nullListeners
    }
  }
}
