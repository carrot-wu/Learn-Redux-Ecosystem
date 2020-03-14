## react hooks
1. React是内部是怎么不用的hooks的
2. React是如何在每次重新渲染之后都能返回最新的状态
3. 状态究竟存放在哪？为什么只能在函数顶层使用Hooks而不能在条件语句等里面使用Hooks

### 解释

```ts
// react-reconciler/src/ReactFiberHooks.js
// Mount 阶段Hooks的定义
const HooksDispatcherOnMount: Dispatcher = {
  useEffect: mountEffect,
  useReducer: mountReducer,
  useState: mountState,
 // 其他Hooks
};

// Update阶段Hooks的定义
const HooksDispatcherOnUpdate: Dispatcher = {
  useEffect: updateEffect,
  useReducer: updateReducer,
  useState: updateState,
  // 其他Hooks
};
```
hooks在mount阶段和update阶段是不一样的。
### 第一次mount阶段
1. 在第一次mount阶段时，会调用mountWorkInProgressHook方法生成一个新的hooks对象，如果当前没有hooks的话会把当前hooks作为第一个hooks，有的话之后把当前hooks通过链表放在上一个hooks的下面。同时，全局有一个workInProgressHook的变量指向当前的hooks，并且把当前hooks返回出来。这个memoizedState链表是一个单向链表。它保存在fiber node的memoizedState属性上。
```ts
// react-reconciler/src/ReactFiberHooks.js
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    baseState: null,
    queue: null,
    baseUpdate: null,
    next: null,
  };
  if (workInProgressHook === null) {
    // 当前workInProgressHook链表为空的话，
    // 将当前Hook作为第一个Hook
    firstWorkInProgressHook = workInProgressHook = hook;
  } else {
    // 否则将当前Hook添加到Hook链表的末尾
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}
```

2. 同时呢会在当前hooks里通过initialState保存当前值在memoizedState。并且会创建一个queue链表，这是一个单向循环链表（环）,queue保存在hooks的queue属性上。返回出去的是初始值，以及一个dispatchAction方法这个后面说。这个queue链表跟上面的hooks链表有点像，不过有两个不同点。
 1. queue的链表有个last属性永远指向最新的updateAction对象，这个属性是为了方便拿到最新updateAction对象（因为多次setXXX都会需要一直拿到最新的updateAction对象，跟上面的hooks不太一样）。
 2. queue是一个单向循环链表(环)，什么意思呢？就是queue的最后一个updateAction对象.next指向的是第一个updateAction对象，形成一个环。所以呢他们可以通过queue.last获取最新的updateAction对象,queue.last.next获取第一个updateAction对象。
```ts
//首次render时执行mountState
function mountState(initialState) {
  // 从当前Fiber生成一个新的hook对象，将此hook挂载到Fiber的hook链尾，并返回这个hook
  var hook = mountWorkInProgressHook();

  hook.memoizedState = hook.baseState = initialState;

  var queue = hook.queue = {
    last: null,
    dispatch: null,
    lastRenderedReducer: (state, action) => isFn(state) ? action(state) : action,
    lastRenderedState: initialState
  };
  // currentlyRenderingFiber$1保存当前正在渲染的Fiber节点
  // 将返回的dispatch和调用hook的节点建立起了连接，同时在dispatch里边可以访问queue对象
  var dispatch = queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue);
  return [hook.memoizedState, dispatch];
}
```
3. 简单说就是mount的时候通过workInProgressHook来保存当前的hooks，然后通过.next来保存hooks，形成一个hooks的单向链表。同时呢，在每一个hooks的内部会维护一个queue的单向循环链表


### updateState阶段
>updateState阶段指的是setXXX之后的阶段

#### setXXX函数做的事情
1. 执行setXXX函数的时候，其实就是执行上文的dispatchAction函数
```ts
  // currentlyRenderingFiber$1保存当前正在渲染的Fiber节点
  // 将返回的dispatch和调用hook的节点建立起了连接，同时在dispatch里边可以访问queue对象
  var dispatch = queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue);
  return [hook.memoizedState, dispatch];
```
2. dispatchAction其实就是生成一个新的updateAction对象，其中action就是传入的值。如果queue.lats没有值说明queue链表为空，把当前updateAction对象当做表头。并且下一个.next指向自己，同时queue.last指向当前最新的updateAction对象。最后会调用react的scheduleWork更新调度。
```ts
//// 功能相当于setState！
function dispatchAction(fiber, queue, action) {
  ...
  var update = {
    action, // 接受普通值，也可以是函数
    next: null,
  };
  var last = queue.last;

  if (last === null) {
    update.next = update;
  } else {
    last.next = update;
  }

  // 略去计算update的state过程
  queue.last = update;
  ...
  // 触发React的更新调度，scheduleWork是schedule阶段的起点
  scheduleWork(fiber, expirationTime);
}

```
#### update阶段（state改变、父组件re-render等都会引起组件状态更新）useState()更新状态：
1. 在updateState的过程中会判断传入的action如果是函数那么执行返回（setState也可以是一个函数）。
```ts
function updateState(initialState) {
  return updateReducer(basicStateReducer, initialState);
}

function basicStateReducer(state, action){
  return typeof action === 'function' ? action(state) : action;
}

```
2. update的时候如何获取当前的hooks链表呢，因为我们知道hooks链表是保存在fiberNode上的memoizedState属性上。如果是第一个hooks直接返回memoizedState即可，第二个hooks通过.next获取就可以了。最终会把解构一个新的newHook拼接在workInProgressHook链表上即可。这样子就能拿到更新时的hooks了。
```ts
// react-reconciler/src/ReactFiberHooks.js
function updateWorkInProgressHook() {
  let nextCurrentHook: null | Hook;
  if (currentHook === null) {
     // 获取fiberNode节点
    let current = currentlyRenderingFiber.alternate;
    if (current !== null) {
      nextCurrentHook = current.memoizedState;
    } else {
      nextCurrentHook = null;
    }
  } else {
    nextCurrentHook = currentHook.next;
  }


  currentHook = nextCurrentHook;

   // 创建一个新的hooks链表 结构
  const newHook: Hook = {
    memoizedState: currentHook.memoizedState,

    baseState: currentHook.baseState,
    baseQueue: currentHook.baseQueue,
    queue: currentHook.queue,

    next: null,
  };
  if (workInProgressHook === null) {
    // This is the first hook in the list.
      // 老的hooks对象直接抛弃 解构一个新的hooks对象返回给当前的memoizedState上 不复用之前的hooks对象了
    currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
  } else {
    // Append to the end of the list.
    workInProgressHook = workInProgressHook.next = newHook;
  }
  return workInProgressHook;
}
```
3. 接下来呢通过updateWorkInProgressHook获取当前的hooks，然后获取queue链表，其中queue.last为最新的action, queue.last.next为第一个action
4. 从第一个action到最新的action循环调用reducer函数获取最新的state值，最后进行返回即可。
```ts
function updateReducer(reducer,initialArg,init) {
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;

  // 拿到更新列表的表头
  const last = queue.last;

  // 获取最早的那个update对象
  first = last !== null ? last.next : null;

  if (first !== null) {
    let newState;
    let update = first;
    do {
      // 执行每一次更新，去更新状态
      const action = update.action;
      newState = reducer(newState, action);
      update = update.next;
    } while (update !== null && update !== first);

    hook.memoizedState = newState;
  }
  const dispatch = queue.dispatch;
  // 返回最新的状态和修改状态的方法
  return [hook.memoizedState, dispatch];
}
```

### useEffect和useLayoutEffect
> useEffect其实前面跟useState类似，都是创建hooks，拼接hooks链表，不同的是effect的回调而已
useEffect其实跟useState一样，分成了mountEffect和updateEffect

```ts
function mountEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null,
): void {
  return mountEffectImpl(
    UpdateEffect | PassiveEffect,
    HookPassive,
    create,
    deps,
  );
}

function updateEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null,
): void {
  return updateEffectImpl(
    UpdateEffect | PassiveEffect,
    HookPassive,
    create,
    deps,
  );
}
```
#### mountEffect
1. 跟useState一样，通过mountWorkInProgressHook创建一个新的hooks，拼接在fiberNode的memoizedState链表上
2. 通过pushEffect方法生成一个effect的单向链表保存在hooks.memoizedState属性上，这个是每一次的effect链表。hooks.memoizedStated的保存的是每一个useEffect自身的effect对象。
3. 但是有时候**一个组件中会有多个useEffect**，所以需要一个componentUpdateQueue单向循环链表来收集所有的useEffect的effect的对象。
4. componentUpdateQueue的引用指向的是fiberNode的updateQueue属性，后续对componentUpdateQueue的修改其实就是修改fiberNode的updateQueue属性
5. componentUpdateQueue收集的是当前fiberNode所有的effect节点。
6. 因为mount阶段的useEffect都会执行，所以mount阶段的effect都会被进行收集进componentUpdateQueue中。

```ts
function mountEffectImpl(fiberEffectTag, hookEffectTag, create, deps): void {
  //创建新的hooks进行拼接
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  currentlyRenderingFiber.effectTag |= fiberEffectTag;
  // 创建一个effect链表 跟useState的queue链表差不多。是一个单向链表，hook.memoizedState保存的都是自身useEffect的effect对象
  //不过属性不一样具体effect可以看pushEffect
  hook.memoizedState = pushEffect(
    HookHasEffect | hookEffectTag,
    create,
    // mount阶段没有需要先执行的destory函数
    undefined,
    nextDeps,
  );
}
function pushEffect(tag, create, destroy, deps) {
  // effect会保存在
  const effect: Effect = {
    tag,
    // 渲染后执行的回调 对应useEffect的回调函数
    create,
    // 下一次渲染前执行的回调 对应useEffect的return的函数
    destroy,
    // 依赖
    deps,
    // Circular
    next: (null: any),
  };

  // 获取当前fiberNode的updateQueue链表  currentlyRenderingFiber.updateQueue
  let componentUpdateQueue: null | FunctionComponentUpdateQueue = (currentlyRenderingFiber.updateQueue: any);

  // 有时候**一个组件中会有多个useEffect**，所以componentUpdateQueue收集的是当前fiberNode所有的effect节点

  // componentUpdateQueue为空 说明是第一个useEffect
  if (componentUpdateQueue === null) {
    // 收集第一个useEffect的第一个effect对象
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    // 这里把componentUpdateQueue的引用指向updateQueue 下次就可以通过fiberNode的updateQueue属性拿到了
    currentlyRenderingFiber.updateQueue = (componentUpdateQueue: any);
    // lastEffect指向最新的effect 单向循环链表
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    // 不是第一个useEffect了
    const lastEffect = componentUpdateQueue.lastEffect;
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
     // 末尾设置最新的effect对象
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      // 单向循环链表执行第一个effect
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }
  return effect;
}
function createFunctionComponentUpdateQueue(): FunctionComponentUpdateQueue {
  return {
    lastEffect: null,
  };
}

```

#### updateEffect
> updateEffect最重要的就是会给那些deps没有发生改变的effect搭上hookEffectTag标记，后续的循环执行回调时会跳过执行
1. 通过areHookInputsEqual函数判断deps是否有改变，没改变的话打上hookEffectTag的tag，后续的循环不会执行回调
2. 如果deps改变那么就会打上HookHasEffect的tag ，并且更新当前hooks的memoizedState属性为effect
```ts
function updateEffectImpl(fiberEffectTag, hookEffectTag, create, deps): void {
  // 跟useState一样获取当前的hook对象
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  let destroy = undefined;

  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState;
         // 获取上一次effect的destroy回调
    destroy = prevEffect.destroy;
    if (nextDeps !== null) {
     // 获取上一次effect的deps
      const prevDeps = prevEffect.deps;
      // 如果deps相同 打上hookEffectTag标记 后续循环的时候不会执行
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        pushEffect(hookEffectTag, create, destroy, nextDeps);
        return;
      }
    }
  }

  currentlyRenderingFiber.effectTag |= fiberEffectTag;

// 如果deps不想同 打上HookHasEffect标记 下次会执行
// 同时 会更新当前hooks的memoizedState树形
  hook.memoizedState = pushEffect(
    HookHasEffect | hookEffectTag,
    create,
    destroy,
    nextDeps,
  );
}

// 浅比较dep的函数
function areHookInputsEqual(
  nextDeps: Array<mixed>,
  prevDeps: Array<mixed> | null,
) {
  if (prevDeps === null) {
    return false;
  }

  // 浅比较
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}
```
最后会执行提交updateQueue的effect列表。
1. 可以发现只有当**if ((effect.tag & tag) === tag)**的时候才会执行相应的回调函数，发现tag是传进来的参数具体是什么值呢。
```ts
function commitHookEffectListUnmount(tag: number, finishedWork: Fiber) {
  const updateQueue: FunctionComponentUpdateQueue | null = (finishedWork.updateQueue: any);
  let lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      if ((effect.tag & tag) === tag) {
        // Unmount
        const destroy = effect.destroy;
        effect.destroy = undefined;
        if (destroy !== undefined) {
          destroy();
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}

function commitHookEffectListMount(tag: number, finishedWork: Fiber) {
  const updateQueue: FunctionComponentUpdateQueue | null = (finishedWork.updateQueue: any);
  let lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      if ((effect.tag & tag) === tag) {
        // Mount
        const create = effect.create;
        effect.destroy = create();
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```

2. 最终我们在commitWork中发现了传入的tag值 `commitHookEffectListUnmount(HookLayout | HookHasEffect, finishedWork)`
3. 以及` commitHookEffectListUnmount(HookLayout | HookHasEffect, finishedWork)`这两个调用函数接收HookHasEffect以及HookLayout，对应我们上面deps发生改变时候的tag
4. HookLayout值的是useLayoutEffect，HookHasEffect指的是useEffect的tag
```ts
function commitWork(current: Fiber | null, finishedWork: Fiber): void {
  if (!supportsMutation) {
    switch (finishedWork.tag) {
      case FunctionComponent:
      case ForwardRef:
      case MemoComponent:
      case SimpleMemoComponent:
      case Block: {
        // Layout effects are destroyed during the mutation phase so that all
        // destroy functions for all fibers are called before any create functions.
        // This prevents sibling component effects from interfering with each other,
        // e.g. a destroy function in one component should never override a ref set
        // by a create function in another component during the same commit.
        if (
          enableProfilerTimer &&
          enableProfilerCommitHooks &&
          finishedWork.mode & ProfileMode
        ) {
          try {
            startLayoutEffectTimer();
            commitHookEffectListUnmount(
              HookLayout | HookHasEffect,
              finishedWork,
            );
          } finally {
            recordLayoutEffectDuration(finishedWork);
          }
        } else {
          commitHookEffectListUnmount(HookLayout | HookHasEffect, finishedWork);
        }
        return;
      }
    }

    commitContainer(finishedWork);
    return;
  }

  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
    case SimpleMemoComponent:
    case Block: {
      // Layout effects are destroyed during the mutation phase so that all
      // destroy functions for all fibers are called before any create functions.
      // This prevents sibling component effects from interfering with each other,
      // e.g. a destroy function in one component should never override a ref set
      // by a create function in another component during the same commit.
      if (
        enableProfilerTimer &&
        enableProfilerCommitHooks &&
        finishedWork.mode & ProfileMode
      ) {
        try {
          startLayoutEffectTimer();
          commitHookEffectListUnmount(HookLayout | HookHasEffect, finishedWork);
        } finally {
          recordLayoutEffectDuration(finishedWork);
        }
      } else {
        commitHookEffectListUnmount(HookLayout | HookHasEffect, finishedWork);
      }
      return;
    }

}
```






-------------------------- ----------------
对于第一个hooks会直接把当前hooks对象赋值给fiberNode的memoizedState对象上，之后的hooks会通过链表.next的形式串联起来。这样子就形成了hooks链表，因为在每一次循环就能通过.next来获取具体的hooks(简单说就是react并不知道调用的是哪个hooks只知道hooks的对应顺序而已)。之所以使用链表的原因就是因为，hooks的更新会进行频繁的插入操作，而且需要通过表头来方便的获取最新值，链表的性能更高（因为后续的每次更新操作actions都会在当前hooks对象中插入到queue中，queue会用来循环调用获取最新的state值）

### 调用set函数
在调用set函数的过程中，每一个hooks内部也维护着一个更新链表queque，当前的更新链表保存着每一次更新的update对象。每一次调用set函数的时候把会update对象最新值放在链表的最末尾。链表内的值时一组循环引用的链表值具体可以看图片
在获取最新值得时候，hooks会把hook的queuestate的每一次set函数的update对象之取出来。如果是useState的话直接返回即可，如果是useReducer的话循环调用即可获得最新的reducer值。

### hooks链表放在那里
组件构建的Hooks链表会挂载到FiberNode节点的memoizedState上面去。

### useEffect和useLayoutEffect副作用的函数
与前面的类型，fiber node中用一个updateQueue的属性保存着所有的useEffect。
1. 在mount的时候会把所有effect通过链表的形式保存起来。在渲染完成之后就会执行fiberNode上的updateQueue所有effect方法。
2. update阶段有点类似，不过update阶段时会判断两次大的dep值，只有dep值发生改变的effect才会保存在fiberNode中然后重新

--------具体可参考下面链接 会更清楚-0--------


## 参考
https://juejin.im/post/5e5e66d6e51d4526e651c796
https://juejin.im/post/5e67143ae51d452717263c13#heading-11
