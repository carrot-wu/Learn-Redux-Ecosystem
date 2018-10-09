import React from "react";
import PropTypes from "prop-types";
import invariant from "invariant";
import { createLocation } from "history";

const isModifiedEvent = event =>
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

/**
 * The public API for rendering a history-aware <a>.
 */

//link就是一个可以简单的判断点击行文的a标签
class Link extends React.Component {
  static propTypes = {
    onClick: PropTypes.func,
    target: PropTypes.string,
    replace: PropTypes.bool,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    innerRef: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
  };

  static defaultProps = {
    replace: false
  };

  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.shape({
        push: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired,
        createHref: PropTypes.func.isRequired
      }).isRequired
    }).isRequired
  };

  //点击行为
  handleClick = event => {
    if (this.props.onClick) this.props.onClick(event);

    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore everything but left clicks
      !this.props.target && // let browser handle "target=_blank" etc.
      !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();

      //获取跳转路由参数
      const { history } = this.context.router;
      const { replace, to } = this.props;

      //传入的是replace 执行router的replacr方法
      if (replace) {
        history.replace(to);
      } else {
        //执行push方法
        history.push(to);
      }
    }
  };

  render() {
    const { replace, to, innerRef, ...props } = this.props; // eslint-disable-line no-unused-vars

    //link必须嵌套在router组件内部(hashrouter或者historyRouter)
    invariant(
      this.context.router,
      "You should not use <Link> outside a <Router>"
    );

    //必须穿to属性
    invariant(to !== undefined, 'You must specify the "to" property');

    const { history } = this.context.router;
    //to可以就收对象或者字符串 判断类型
    const location =
      typeof to === "string"
        ? createLocation(to, null, null, history.location)
        : to;

    const href = history.createHref(location);
    return (
      <a {...props} onClick={this.handleClick} href={href} ref={innerRef} />
  );
  }
}

export default Link;