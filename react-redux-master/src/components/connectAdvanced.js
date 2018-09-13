import hoistStatics from 'hoist-non-react-statics'
import invariant from 'invariant'
import { Component, createElement } from 'react'
//订阅器
import Subscription from '../utils/Subscription'
import { storeShape, subscriptionShape } from '../utils/PropTypes'
//开发模式下用来热更新
let hotReloadingVersion = 0
//这个有点黑科技用来当前组件需要重新渲染是 通过this.stetState（dummyState）来触发重新渲染
const dummyState = {}
function noop() {}
function makeSelectorStateful(sourceSelector, store) {
  // wrap the selector in an object that tracks its results between runs.
  //下面每次的this.selector.run（）其实都是对比新旧props来判断是够需要重新渲染
  const selector = {
    run: function runComponentSelector(props) {
      try {
        //run方法会进行浅比较重新计算当前Connect组件的props 返回的 selector.shouldComponentUpdate可用于触发是否更新
        const nextProps = sourceSelector(store.getState(), props)
        if (nextProps !== selector.props || selector.error) {
          selector.shouldComponentUpdate = true
          selector.props = nextProps
          selector.error = null
        }
      } catch (error) {
        selector.shouldComponentUpdate = true
        selector.error = error
      }
    }
  }

  return selector
}

export default function connectAdvanced(
  /*
    selectorFactory is a func that is responsible for returning the selector function used to
    compute new props from state, props, and dispatch. For example:

      export default connectAdvanced((dispatch, options) => (state, props) => ({
        thing: state.things[props.thingId],
        saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
      }))(YourComponent)

    Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
    outside of their selector as an optimization. Options passed to connectAdvanced are passed to
    the selectorFactory, along with displayName and WrappedComponent, as the second argument.

    Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
    props. Do not use connectAdvanced directly without memoizing results between calls to your
    selector, otherwise the Connect component will re-render on every state or props change.
  */
  //英文注释说得很清楚了selectorFactory是一个工厂函数 返回一个用于根据state，props，dispatch计算出新props的函数
  selectorFactory,
  // options object:
  {
    // the func used to compute this HOC's displayName from the wrapped component's displayName.
    // probably overridden by wrapper functions such as connect()
    getDisplayName = name => `ConnectAdvanced(${name})`,

    // shown in error messages
    // probably overridden by wrapper functions such as connect()
    methodName = 'connectAdvanced',

    // if defined, the name of the property passed to the wrapped element indicating the number of
    // calls to render. useful for watching in react devtools for unnecessary re-renders.
    //用于一些插件来打印重新渲染的次数 用于优化性能
    renderCountProp = undefined,

    // determines whether this HOC subscribes to store changes
    //是否允许组件订阅store的变化 如果为false的话就是不需要监听state变化
    shouldHandleStateChanges = true,

    // the key of props/context to get the store
    storeKey = 'store',

    // if true, the wrapped element is exposed by this HOC via the getWrappedInstance() function.
    //如果设置为true 可以通过getWrappedInstance的方法获取原组件的实例
    withRef = false,

    // additional options are passed through to the selectorFactory
    //额外参数
    ...connectOptions
  } = {}
) {
  const subscriptionKey = storeKey + 'Subscription'
  //开发环境下每次热更新递归加一
  const version = hotReloadingVersion++

  //获取父级组件传过来的store和订阅器 这里的store是provider的store 至于订阅器（有可能是provider的 也有可能是上一级connect的父组件的 下面分析完你就知道了）
  const contextTypes = {
    [storeKey]: storeShape,
    [subscriptionKey]: subscriptionShape,
  }
  //要传给子组件的context--订阅器
  const childContextTypes = {
    [subscriptionKey]: subscriptionShape,
  }
  //调用connect之后返回的hoc函数（高阶组件） WrappedComponent为接受的容器组件
  return function wrapWithConnect(WrappedComponent) {
    invariant(
      //WrappedComponent只能为自定义组件
      typeof WrappedComponent == 'function',
      `You must pass a component to the function returned by ` +
      `${methodName}. Instead received ${JSON.stringify(WrappedComponent)}`
    )
    //获取传入的容器组件名字
    const wrappedComponentName = WrappedComponent.displayName
      || WrappedComponent.name
      || 'Component'
    //拼装connect之后生成的组件名字 在react-devtools可以看到connect(组件名字)
    const displayName = getDisplayName(wrappedComponentName)

    //要传入selectorFactory工厂函数的参数
    const selectorFactoryOptions = {
      ...connectOptions,
      getDisplayName,
      methodName,
      renderCountProp,
      shouldHandleStateChanges,
      storeKey,
      withRef,
      displayName,
      wrappedComponentName,
      WrappedComponent
    }

    // TODO Actually fix our use of componentWillReceiveProps
    /* eslint-disable react/no-deprecated */

    //connect(mapStateTProps,mapStateToDispatch)(wrapperComponent) 之后返回的容器组件
    class Connect extends Component {
      constructor(props, context) {
        super(props, context)
        //用于开发时候的热更新
        this.version = version
        this.state = {}
        //render调用次数
        this.renderCount = 0
        //获取store
        this.store = props[storeKey] || context[storeKey]
        //判断store是从props传下来的 默认是context就是一个store  如果是多个store 那么propsMode为true（redux官网不推荐）
        this.propsMode = Boolean(props[storeKey])
        this.setWrappedInstance = this.setWrappedInstance.bind(this)

        invariant(this.store,
          `Could not find "${storeKey}" in either the context or props of ` +
          `"${displayName}". Either wrap the root component in a <Provider>, ` +
          `or explicitly pass "${storeKey}" as a prop to "${displayName}".`
        )
        //初始化selector
        this.initSelector()
        //初始化发布订阅 下面155行说的父组件订阅redux 子组件订阅父组件
        this.initSubscription()
      }

      getChildContext() {
        // If this component received store from props, its subscription should be transparent
        // to any descendants receiving store+subscription from context; it passes along
        // subscription passed to it. Otherwise, it shadows the parent subscription, which allows
        // Connect to control ordering of notifications to flow top-down.
        //如果父组件的connect 那么会初始化一个发布订阅器用于订阅redux的变化 如果是子组件的connect（必须有父组件进行过connect） 那么不应该再重新对redux进行订阅  父子connect了 都进行订阅会造成性能上的浪费 父组件的render造成子组件render 子组件又render 而且 不符合react的flow从上到下数据流 应该是父render-子render的流程
        //每一个connect的组件内部都有一个订阅器 只有根节点的父组件会订阅redux 其余的会订阅上一层connect父组件的订阅器（subscription）  什么意思呢 就是最根节点的父组件的connect会进行订阅redux 父组件下所有的子组件connect都会去订阅上一级父组件的订阅 简单说就是 根父组件订阅redux 子组件订阅上一级父组件（在初始化发布订阅的函数里面可以看到initSubscription）
        //就是这样 a是根父组件 b是a的子组件 c是b的子组件以此类推 那么 redux-a-b-c
        //一旦redux的store发生变化 那么每个组件（不仅仅是根父组件 只要有connect的子组件）把更新子组件的方法赋值给componentDidUpdate生命周期 保证父组件渲染更新完后才执行子组件的渲染） 。如果根父组件发现不需要更新 那么通知它的第二级connect组件就是b 你去执行以下你自己的onStateChange看下需不需要更新 以此类推 就实现了自上往下的渲染更新

        //传递context 如果store是从props上传的就从context里面拿 不然的话（一般是这种情况 单一store）把当前的subscription订阅器通过context向下传递
        const subscription = this.propsMode ? null : this.subscription
        return { [subscriptionKey]: subscription || this.context[subscriptionKey] }
      }

      componentDidMount() {
        //没有传入mapStateToProps 不进行订阅
        if (!shouldHandleStateChanges) return

        // componentWillMount fires during server side rendering, but componentDidMount and
        // componentWillUnmount do not. Because of this, trySubscribe happens during ...didMount.
        // Otherwise, unsubscription would never take place during SSR, causing a memory leak.
        // To handle the case where a child component may have triggered a state change by
        // dispatching an action in its componentWillMount, we have to re-run the select and maybe
        // re-render.

        //进行订阅 上面英文部分说明了为什么不在componentWillMount进行订阅的原因以及ssr的一些问题
        this.subscription.trySubscribe()
        this.selector.run(this.props)
        if (this.selector.shouldComponentUpdate) this.forceUpdate()
      }

      componentWillReceiveProps(nextProps) {
        //接受新的props重新进行比较
        this.selector.run(nextProps)
      }

      shouldComponentUpdate() {
        //上面的this.selector.run(this.props)执行完毕之后 如果比较的props值发生变化 那么this.selector.shouldComponentUpdate会置为true进行重新渲染
        return this.selector.shouldComponentUpdate
      }

      componentWillUnmount() {
        //组件卸载 取消订阅 防止内存泄露
        if (this.subscription) this.subscription.tryUnsubscribe()
        this.subscription = null
        this.notifyNestedSubs = noop
        this.store = null
        this.selector.run = noop
        this.selector.shouldComponentUpdate = false
      }

      getWrappedInstance() {
        //withRef如果没有设置为true 是无法听过该方法获取原组件的
        invariant(withRef,
          `To access the wrapped instance, you need to specify ` +
          `{ withRef: true } in the options argument of the ${methodName}() call.`
        )
        return this.wrappedInstance
      }

      //设置原组件的实例
      setWrappedInstance(ref) {
        this.wrappedInstance = ref
      }

      initSelector() {
        //生成selector
        const sourceSelector = selectorFactory(this.store.dispatch, selectorFactoryOptions)
        this.selector = makeSelectorStateful(sourceSelector, this.store)
        this.selector.run(this.props)
      }

      initSubscription() {
        if (!shouldHandleStateChanges) return

        // parentSub's source should match where store came from: props vs. context. A component
        // connected to the store via props shouldn't use subscription from context, or vice versa.
        //多store情况不考虑
        //获取父组件的订阅器  如果是父组件那么就再找context上的其实就是provider组件上的subscriptionKey 打开provider文件35行 就是null
        //如果是子组件connect 实际上拿的就是父组件connect传的订阅器160-161行
        const parentSub = (this.propsMode ? this.props : this.context)[subscriptionKey]
        this.subscription = new Subscription(this.store, parentSub, this.onStateChange.bind(this))

        // `notifyNestedSubs` is duplicated to handle the case where the component is unmounted in
        // the middle of the notification loop, where `this.subscription` will then be null. An
        // extra null check every change can be avoided by copying the method onto `this` and then
        // replacing it with a no-op on unmount. This can probably be avoided if Subscription's
        // listeners logic is changed to not call listeners that have been unsubscribed in the
        // middle of the notification loop.
        //这里绑定的过程中 上面注释说了 是为了解决在notification loop循环通知子组件的过程中 组件卸载了 那么该组件的订阅器subscription也为空 可查看上面的componentWillUnmount生命周期 会报错
        //所以现行拷贝一个
        this.notifyNestedSubs = this.subscription.notifyNestedSubs.bind(this.subscription)
      }
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
      //在当前组件进行跟新完成之后 通知connect的子组件也进行渲染更新 保证父组件渲染更新完后才执行子组件的渲染
      notifyNestedSubsOnComponentDidUpdate() {
        // `componentDidUpdate` is conditionally implemented when `onStateChange` determines it
        // needs to notify nested subs. Once called, it unimplements itself until further state
        // changes occur. Doing it this way vs having a permanent `componentDidUpdate` that does
        // a boolean check every time avoids an extra method call most of the time, resulting
        // in some perf boost.
        //重新把当前组件的componentDidUpdate生命周期置为undefined
        this.componentDidUpdate = undefined
        //执行更新connect子组件的方法
        this.notifyNestedSubs()
      }

      isSubscribed() {
        return Boolean(this.subscription) && this.subscription.isSubscribed()
      }

      //添加一些需要在option这是的props 比如 ref renderCount 等
      addExtraProps(props) {
        if (!withRef && !renderCountProp && !(this.propsMode && this.subscription)) return props
        // make a shallow copy so that fields added don't leak to the original selector.
        //浅赋值传入的props防止额外添加的props影响到原始的selector  原来的selector上有mapStateToprops 和dispatch的一些数据和方法
        // this is especially important for 'ref' since that's a reference back to the component
        // instance. a singleton memoized selector would then be holding a reference to the
        // instance, preventing the instance from being garbage collected, and that would be bad
        const withExtras = { ...props }
        if (withRef) withExtras.ref = this.setWrappedInstance
        if (renderCountProp) withExtras[renderCountProp] = this.renderCount++
        //如果存在多store的情况下 把当前的store也进项传递给下一层
        if (this.propsMode && this.subscription) withExtras[subscriptionKey] = this.subscription
        return withExtras
      }

      render() {
        //每次执行了render方法之后 把selector的shouldComponentUpdate从新置为false 等待订阅的state发生了改变时触发this.selector.run（）把shouldComponentUpdate置为true
        const selector = this.selector
        selector.shouldComponentUpdate = false

        if (selector.error) {
          throw selector.error
        } else {
          //返回之前的组件 映射新数据到props上
          return createElement(WrappedComponent, this.addExtraProps(selector.props))
        }
      }
    }

    /* eslint-enable react/no-deprecated */
    //设置静态属性
    Connect.WrappedComponent = WrappedComponent
    Connect.displayName = displayName
    Connect.childContextTypes = childContextTypes
    Connect.contextTypes = contextTypes
    Connect.propTypes = contextTypes

    if (process.env.NODE_ENV !== 'production') {
      //开发环境下 设置热更新

      Connect.prototype.componentWillUpdate = function componentWillUpdate() {
        // We are hot reloading!
        if (this.version !== version) {
          this.version = version
          this.initSelector()

          // If any connected descendants don't hot reload (and resubscribe in the process), their
          // listeners will be lost when we unsubscribe. Unfortunately, by copying over all
          // listeners, this does mean that the old versions of connected descendants will still be
          // notified of state changes; however, their onStateChange function is a no-op so this
          // isn't a huge deal.
          let oldListeners = [];

          if (this.subscription) {
            oldListeners = this.subscription.listeners.get()
            this.subscription.tryUnsubscribe()
          }
          this.initSubscription()
          if (shouldHandleStateChanges) {
            this.subscription.trySubscribe()
            oldListeners.forEach(listener => this.subscription.listeners.subscribe(listener))
          }
        }
      }
    }

    return hoistStatics(Connect, WrappedComponent)
  }
}
