import { Component, Children } from 'react'
import PropTypes from 'prop-types'
import { storeShape, subscriptionShape } from '../utils/PropTypes'
import warning from '../utils/warning'

let didWarnAboutReceivingStore = false
// 判断传入provider的store是否发生了改变
function warnAboutReceivingStore() {
  if (didWarnAboutReceivingStore) {
    return
  }
  didWarnAboutReceivingStore = true

  warning(
    '<Provider> does not support changing `store` on the fly. ' +
    'It is most likely that you see this error because you updated to ' +
    'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' +
    'automatically. See https://github.com/reduxjs/react-redux/releases/' +
    'tag/v2.0.0 for the migration instructions.'
  )
}

//provider组件的工厂函数
export function createProvider(storeKey = 'store') {
    const subscriptionKey = `${storeKey}Subscription`
    //这里就是我们传入store的provider组件
    class Provider extends Component {
      //18/9/11 我拉的版本依然是使用老版本的context 我看了一下官方的其他分支 已经有在测试使用v16之后的新context来编写

      //把传入的store添加到getChildContext中
        getChildContext() {
          return { [storeKey]: this[storeKey], [subscriptionKey]: null }
        }

        constructor(props, context) {
          super(props, context)
          this[storeKey] = props.store;
        }

        render() {
          //返回children里仅有的子级。否则抛出异常。 就是有且只能有一个子组件
          return Children.only(this.props.children)
        }
    }

    if (process.env.NODE_ENV !== 'production') {
      //非生产模式下 componentWillReceiveProps中判断当前传入的store与传递的store是否相同
      Provider.prototype.componentWillReceiveProps = function (nextProps) {
        if (this[storeKey] !== nextProps.store) {
          warnAboutReceivingStore()
        }
      }
    }

    Provider.propTypes = {
        store: storeShape.isRequired,
        children: PropTypes.element.isRequired,
    }
    //定义的childContextTypes 用于进行传递给所有的子组件
    Provider.childContextTypes = {
        [storeKey]: storeShape.isRequired,
        [subscriptionKey]: subscriptionShape,
    }

    return Provider
}

export default createProvider()
