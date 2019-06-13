// vue生命周期的解释 https://juejin.im/post/5ad10800f265da23826e681e


// 相对于传统的on emit slot slot-scope组件封装方法 接下来将提供一下更高级 更进阶的组件封装方法

/* ------------------------------------------------------------------  */
//第一种provide 和 inject （类似于react中的provider 和 consumer）其实就是react的上下文
// 可以再父组件中provide注册一些属性 这样子在嵌套层次多深的子组件中通过inject都可以拿到注册的值
// symbol.js
const symbolName = Symbol('A')
// A.vue b是a的子组件
export default {
  data(){
    return {
      name: 'parent'
    }
  },
  provide: {
    [symbolName]: this,
    name: this.name
  },
  methods: {
    test() {
      this.name = 'test'
    }
  }
}
// B.vue
export default {
  inject: {symbolName, name: 'name'},
  mounted () {
    // 一样 之上上面的是组件实例
    console.log(this.symbolName.name)  // parent
    console.log(this.name)  // parent
    this.symbolName.test()
    //this.name 不会发生改变 但是this.symbolName.name会
  }
}
// 其中注意的是 提示：provide 和 inject 绑定并不是可响应的。这是刻意为之的。然而，如果你传入了一个可监听的对象，那么其对象的属性还是可响应的。
// 为了防止子组件误用属性 所以一般都会用symbol作为key
// 简单说传入的值并不是响应式的 与react一样 一般的做法是传入父组件的实例 获取值之后 如果要修改的话可以通过父组件实例方法直接进行修改


//vue中对于computed的是实现
/*
* vue中 对于computed的初始化在initState中
* 初始化的时候会实例化一个watcher 这个watcher叫做 computed watcher 与之前的渲染watcher不同
* 之后会对computed中的属性进行响应式get set重写
* 在get方法中 因为会收取this.data的值 所以会触发data的响应式 所以data中会把当前的computed watcher也收集进依赖中
* 最后就会获取值 同时内部对值进行了缓存 用过this.dirty变量 如果为true那么直接重新获取值然后shezhiweifalse
* 当 对于computed的依赖数据发生变化时 那么会触发setter方法 对于computed watcher 会执行update方法进行更新数据 并且设置this.dirty为true
*
*
* */

// vue中的 watcher 只是set的时候触发函数调用个容易 跟this。data set有关

// vue 中的watcher有四中类型

/*
* 1 deep watcher
*  在watcher一个深层次对象时候 这个时候是不会 log 任何数据的，因为我们是 watch 了 a 对象，只触发了 a 的 getter，并没有触发 a.b 的 getter，所以并没有订阅它的变化，导致我们对 vm.a.b = 2 赋值的时候，虽然触发了 setter，但没有可通知的对象，所以也并不会触发 watch 的回调函数了。

而我们只需要对代码做稍稍修改，就可以观测到这个变化了
watch: {
  a: {
    deep: true,
    handler(newVal) {
      console.log(newVal)
    }
  }
}
*
* 2 user watcher
前面我们分析过，通过 vm.$watch 创建的 watcher 是一个 user watcher，其实它的功能很简单，在对 watcher 求值以及在执行回调函数的时候。
*
* 3computed watcher
computed watcher 几乎就是为计算属性量身定制的，我们刚才已经对它做了详细的分析，这里不再赘述了。

# 4 sync watcher
在我们之前对 setter 的分析过程知道，当响应式数据发送变化后，触发了 watcher.update()，只是把这个 watcher 推送到一个队列中，在 nextTick 后才会真正执行 watcher 的回调函数。而一旦我们设置了 sync，就可以在当前 Tick 中同步执行 watcher 的回调函数。
* */
