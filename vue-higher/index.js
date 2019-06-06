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
