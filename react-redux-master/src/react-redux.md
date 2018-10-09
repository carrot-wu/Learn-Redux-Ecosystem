做个笔记 记录一下react-redux的工作流程
首先provider 就是一个组件 通过context 把获取的store进行注入 这样子组件内部都可以获取到store的值 第二个同时注入的还有一个Subscribed = null 这个是一个订阅器 用于判断根节点的connect组件直接订阅store的subscrion
接着就是connect  connect 内部可以接受四个参数 两个maState 一个是option 一个是mergeprops
selector的factor函数在调用后会把state和prop的参数通过props的注入到组件中 返回一个高阶函数
接着就是selector的作用 selector就是一个函数 在经过safetfulselector的调用后 有一个run方法 这个run方法内部又一个缓存 每次调用都会通过之前以及现在的props进行浅比较来设置组件的shouldComponent是否为true来判断是否要渲染

接着就是Subscribed  在组建挂载完毕之后 会判断当前的父context 是否有Subscribed 这个参数 有的话证明是子connect 不然就是根组件connect 对用有两种方法

如果是根组件connect  直接订阅把connect组件的 onStatechange方法直接订阅store的subscrition函数

onStatechange是个啥 就是在dispatch的时候 store会触发根节点的订阅的Subscribed 就是根组件的onStatechange方法 通过selector判断是否要渲染设置shouldComponent 如果需要渲染的话那么正常渲染（通过内部的setState一个空对象方法进行强制性渲染） 同时设置自身的componentDidUpdate之后派发他自己内部的发布订阅器 内部是子组件的connect方法的onStatechange 这样子就保持了从上到下的渲染流程 如果不需要渲染shouldComponent为fasle 那么久直接派发子组件 久一直接下来的这个流程
      //组件进行订阅的回调方法
      onStateChange() {
        //把store的state数据 和 当前的props数据以及mapstateToprops进行对比 判断是否要重新渲染
        this.selector.run(this.props)

        if (!this.selector.shouldComponentUpdate) {
          //当前connect组件不需要 那么通知connect的子组件的onStateChange方法执行判断是否要重新渲染
          this.notifyNestedSubs()
        } else {
          //需要渲染
          //把下面更新子组件的方法赋值给componentDidUpdate生命周期 保证父组件渲染更新完后才执行子组件的渲染
          this.componentDidUpdate = this.notifyNestedSubsOnComponentDidUpdate
          //当前组件渲染的操作 秀的头皮发麻 用一个假的state空对象重新设置state来重新渲染
          this.setState(dummyState)
        }
      }

 如果是子组件的connect 那么子组件的onstatechangge方法会直接订阅上一层父connect的订阅器 每一层的订阅器都会通过context重新往下传

 最简单的原理就是provider用于把store的通过context进行传递同时传递一个undefined的订阅器Subscribed
 connect方法内部初始化一个selector函数 这个函数在经过safetyselector的调用后用于计算传入的mapState获取的props和上一次的props浅比较判断是否要重新渲染进而设置shouldComponent是否为true
 接着connect内部也会初始化一个订阅器Subscribed 如果是根父组件的connect这时候判断到context的Subscribed订阅器是为null那么直接把自己当前的onstatechangge方法直接班定于store的substrion方法
 onstatechange就是一个函数 根据前面selector判断的是否要渲染（就是设置shouldComponentUpdate是否为true）如果要渲染的话那么通过setState（{}）一个空对象枪指向渲染 并且设置componentDidupdate方法确保父组件更新完成之后在调用父组件的发布订阅函数（内部是connect的子组件onstatechange方法）这样子就构成了从上到下的单向渲染流程 如果不渲染的话直接调用子组件的onstatechange方法
 如果是子connect的话那么这样是是可以拿到父connect组件的订阅器（通过context传下来的）这时候流程一样 只是ziconnect不绑定与store的stribtion函数（就是不直接监听与store的变化而是绑定父connect组件的订阅器） 把自己的onstatechange方法订阅与父connect组件的发布订阅函数中 。

 最红在调用dispatch的过程中 先触发redux store的scribtion方法 触发根父connect组件的onstatechange方法 触发selectot。run计算出props判断是否渲染 再而在渲染完毕之后的生命周期didupdate之后帝爱用自身订阅器的子connect组件的onstatechange方法这样子依次执行