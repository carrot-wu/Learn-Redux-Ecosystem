
//http://www.ayqy.net/blog/dive-into-react-fiber/好文
//再讲react本身之前 先说明 react本身是不做任何东西的 制作一件事 就是生成对象语法树 至于生成对象语法树之后的渲染由不同平台对应的库reactDom reactNative进行编译生成
//仅仅只是定义了一些常用的方法 比如createElement方法 最终返回的是一个对象语法树
//在web中 真正起到关键的作用的是reactDom这个库 这个库内部封装了把cdom生成真实节点的方法 下面写的mount方法其实就是reactDom的简洁版
var React = {
  Children: {
    map: mapChildren,
    forEach: forEachChildren,
    count: countChildren,
    toArray: toArray,
    only: onlyChild
  },

  createRef: createRef,
  Component: Component,
  PureComponent: PureComponent,

  createContext: createContext,
  forwardRef: forwardRef,

  Fragment: REACT_FRAGMENT_TYPE,
  StrictMode: REACT_STRICT_MODE_TYPE,
  unstable_AsyncMode: REACT_ASYNC_MODE_TYPE,
  unstable_Profiler: REACT_PROFILER_TYPE,

  createElement: createElementWithValidation,
  cloneElement: cloneElementWithValidation,
  createFactory: createFactoryWithValidation,
  isValidElement: isValidElement,

  version: ReactVersion,

  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: ReactSharedInternals
};
/*
* 接下来讲的都是react的mount方法的实现  类似于reactDom.render(</app>)
* 首先必须知道的是jsx会经过babel的编译变成react.createElement(type,{props},children)的方法 这个方法返回一个对象就是所谓的vdom{type:类型,props:{children,className}}
* */
//所以mount方法接受的参数就是一个vdom的对象 我们称之为element

/*
DOM 真实DOM节点 真实的dom节点
-------
  Instances React维护的vDOM tree node instance是经过element生成的实例 类似于elements之中的type组件经过调用 每个实例都有自己的生命周期和状态
-------
  Elements 描述UI长什么样子（type, props） 就是经过react.createELement生成的对象语法树
*/

/*
* 在fiber之前的reconciler（被称为Stack reconciler）这种方式的调节只能自顶向下递归调用mountComponent/updateComponent,无法中断（持续占用主线程）这样子的渲染线程一直处于被占用状态 ui界面无法得到实时更新
* fiber的新架构做了那么几件事情 1把任务拆分成几个小任务  把各个任务进行优先级的拆分 父子之间的任务可以随时切换 也就是每次做任务的时候如果做完了那么久看还有没有时间做完其他任务 如果超出时间了 先把任务挂起 把控制权交给主线程
* */

/*
* fiber架构中 声明周期的变化
* // 第1阶段 render/reconciliation
componentWillMount
componentWillReceiveProps
shouldComponentUpdate
componentWillUpdate

// 第2阶段 commit
componentDidMount
componentDidUpdate
componentWillUnmount
*
* 第1阶段的生命周期函数可能会被多次调用，默认以low优先级（后面介绍的6种优先级之一）执行，被高优先级任务打断的话，稍后重新执行
* 所以在fiber之后为什么推荐fetch请求不妨在willmount 因为第一会被废弃掉 第二componentWillMount在依次渲染中可能会被调用几次
* */
/*
* 从15到16，源码结构发生了很大变化：

再也看不到mountComponent/updateComponent()了，被拆分重组成了（beginWork/completeWork/commitWork()）

ReactDOMComponent也被去掉了，在Fiber体系下DOM节点抽象用ReactDOMFiberComponent表示，组件用ReactFiberClassComponent表示，之前是ReactCompositeComponent

Fiber体系的核心机制是负责任务调度的ReactFiberScheduler，相当于之前的ReactReconciler

vDOM tree变成fiber tree了，以前是自上而下的简单树结构，现在是基于单链表的树结构，维护的节点关系更多一些
* */

function mount(element){
  //其中element我们会区分两种类型 一种是composite component 这种组件就是自定义组件包括函数组件以及class组件
  //另外一种就是原生标签组件 这时候原生标签是一个字符串
}

