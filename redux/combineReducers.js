import ActionTypes from './utils/actionTypes'
import warning from './utils/warning'
import isPlainObject from './utils/isPlainObject'

function getUndefinedStateErrorMessage(key, action) {
  const actionType = action && action.type
  const actionDescription =
    (actionType && `action "${String(actionType)}"`) || 'an action'

  return (
    `Given ${actionDescription}, reducer "${key}" returned undefined. ` +
    `To ignore an action, you must explicitly return the previous state. ` +
    `If you want this reducer to hold no value, you can return null instead of undefined.`
  )
}

function getUnexpectedStateShapeWarningMessage(
  inputState,
  reducers,
  action,
  unexpectedKeyCache
) {
  const reducerKeys = Object.keys(reducers)
  //判断当前的action是开发者自定义的还是redux内部的action
  const argumentName =
    action && action.type === ActionTypes.INIT
      ? 'preloadedState argument passed to createStore'
      : 'previous state received by the reducer'

  //筛选过后的reducers数组如果为空也抛出错误
  if (reducerKeys.length === 0) {
    return (
      'Store does not have a valid reducer. Make sure the argument passed ' +
      'to combineReducers is an object whose values are reducers.'
    )
  }
  //rootReucer 根reducer的state默认值必须是一个对象用于保存子reducer 不是的话抛出警告
  if (!isPlainObject(inputState)) {
    return (
      `The ${argumentName} has unexpected type of "` +
      {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] +
      `". Expected argument to be an object with the following ` +
      `keys: "${reducerKeys.join('", "')}"`
    )
  }

  const unexpectedKeys = Object.keys(inputState).filter(
    key => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]
  )

  unexpectedKeys.forEach(key => {
    unexpectedKeyCache[key] = true
  })

  if (action && action.type === ActionTypes.REPLACE) return

  if (unexpectedKeys.length > 0) {
    return (
      `Unexpected ${unexpectedKeys.length > 1 ? 'keys' : 'key'} ` +
      `"${unexpectedKeys.join('", "')}" found in ${argumentName}. ` +
      `Expected to find one of the known reducer keys instead: ` +
      `"${reducerKeys.join('", "')}". Unexpected keys will be ignored.`
    )
  }
}

/*
一个简单的reducer
function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      ...TODO
      return 新的state
    case 'TOGGLE_TODO':
      ...TODO
      return 新的state
    default:
      return state;
  }
}
*/

//可配合上面的简易reducer函数进行理解
function assertReducerShape(reducers) {
  Object.keys(reducers).forEach(key => {
    //遍历reducer
    const reducer = reducers[key]
    //先依次执行reducer 看是否有默认返回值state 其中ActionTypes.INIT为内部自定义的action 自然而然的执行到default 如果返回undefined 抛出错误 state要有默认值
    const initialState = reducer(undefined, { type: ActionTypes.INIT })

    if (typeof initialState === 'undefined') {
      throw new Error(
        `Reducer "${key}" returned undefined during initialization. ` +
        `If the state passed to the reducer is undefined, you must ` +
        `explicitly return the initial state. The initial state may ` +
        `not be undefined. If you don't want to set a value for this reducer, ` +
        `you can use null instead of undefined.`
      )
    }
    if (
      typeof reducer(undefined, {
        type: ActionTypes.PROBE_UNKNOWN_ACTION()
      }) === 'undefined'
    ) {
      throw new Error(
        `Reducer "${key}" returned undefined when probed with a random type. ` +
        `Don't try to handle ${
          ActionTypes.INIT
          } or other actions in "redux/*" ` +
        `namespace. They are considered private. Instead, you must return the ` +
        `current state for any unknown actions, unless it is undefined, ` +
        `in which case you must return the initial state, regardless of the ` +
        `action type. The initial state may not be undefined, but can be null.`
      )
    }
  })
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */

//通过源码 我们可以看到combineReducers其实接受要合并的reducer对象 返回combination函数 其实combination还是一个reducer dispatch（action）的时候 会依次调用子reducer计算出子reducer的state值再而合并成对象。

//combineReducers一开始会循环所有的子reducer 筛选出可用的reducer(state 不能为underfined  子reducer在redux内部自定义action的时候必须返回默认值state)并且生成真正可用的finalReducers**
//dispatch（action）的时候 会循环所有的子reducer传入action依次生成新的子state值 之后浅比较之前的state和新生成的state 如果浅比较不相同就把hasChanged赋值为true 证明子state改变了自然而然总state也改变了**
//combination在返回state值时会进行判断 判断当前的hasChanged是否为true 是的话证明state发生了变化返回新的state 不然state没有变化返回旧的state值**


/*
* combineReducers 辅助函数的作用是，把一个由多个不同 reducer 函数作为 value 的 object，合并成一个最终的 reducer 函数，然后就可以对这个 reducer 调用 createStore 方法。
* 用法 const rootReducer = combineReducers({a:aReducer,b:bReducer})
* 实际上rootreducer 还是一个函数 rootReducer执行返回值是一个子reducer集合的对象
* */
export default function combineReducers(reducers) {
  //获取所有子reducers的key值
  const reducerKeys = Object.keys(reducers)
  //筛选后可用的reducers
  const finalReducers = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]
    /*
    * 开发环境下下遍历所有子reducers的value值
    * 如果value为undefined 抛出警告
    * 即 combineReducers({a:aReducer,b:bReducer}) 中的aReducer 不能为underfined
    * */
    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        warning(`No reducer provided for key "${key}"`)
      }
    }

    //进行筛选 筛选出函数类型的reducer
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }
  const finalReducerKeys = Object.keys(finalReducers)

  let unexpectedKeyCache
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {}
  }

  let shapeAssertionError
  try {
    //判断reducer中是否有设置默认返回值 查看81行注释
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }

  return function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError
    }

    //一些错误判断处理
    if (process.env.NODE_ENV !== 'production') {
      const warningMessage = getUnexpectedStateShapeWarningMessage(
        state,
        finalReducers,
        action,
        unexpectedKeyCache
      )
      if (warningMessage) {
        warning(warningMessage)
      }
    }
    //state是否改变 这里判断state是否改变是通过浅比较的 所以才要求每次返回的state都是一个全新的对象
    let hasChanged = false
    //新的state值 这里的state是根rootReducer的state
    const nextState = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i]
      //根据key值获取相当应的子reducer
      const reducer = finalReducers[key]
      //获取上一次当前key值所对应的state值 下面要进行浅比较
      const previousStateForKey = state[key]
      //获取传入action之后新生成的state值
      const nextStateForKey = reducer(previousStateForKey, action)
      if (typeof nextStateForKey === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      //循环执行reducer 把新的值进行存储
      nextState[key] = nextStateForKey
      //浅比较  这里把旧的子reducer state值 与传入action之后生成的state值进行浅比较 判断state是否改变了
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    //根据判断赶回state   只要有一个子reducer hasChanged为true那么就重新返回新的nextState  所以这里揭示了为什么reducer必须是纯函数而且如果state改变了必须返回一个新的对象
    //如果返回的是依然的state对象（有副作用的push，pop方法）如果state是对象 因为nextStateForKey !== previousStateForKey比较的是引用 那么 hasChanged认为是false没有发生改变 自然而然下面返回的state依然是旧的state
    return hasChanged ? nextState : state
  }
}