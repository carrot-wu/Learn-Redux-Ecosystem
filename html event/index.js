// 对于前段事件对象的理解

// 点击一个目标时完整的事件触发
/*-------------------------------------IMPORTANT --------------------------------*/
// 1 先从根节点开始触发捕获事件 直到当前点击的目标
// 2 到达当前触发事件的目标 （目标也可能注册了冒泡或者捕获事件） 按照该目标的事件注册顺序进行触发 （不区分冒泡 或者捕获 ）
// 3 从当前目标父节点开始 触发冒泡事件直到根节点

/*
*
      let parentNode = document.getElementById('parent')
      // 因为触发标签不同，导致输出顺序不同
      // 点击parent会输出冒泡，捕获，因为目标节点按照绑定顺序输出
      // 点击child会输出捕获，冒泡，因为非目标节点正常按照浏览器事件机制执行
      let child = document.getElementById('child')
      parentNode.addEventListener(
        'click',
        event => {
          console.log('冒泡')
        },
        false
      )
      parentNode.addEventListener(
        'click',
        event => {
          console.log('捕获 ')
        },
        true
      )


      child.addEventListener(
        'click',
        event => {
          console.log('child冒泡')
        },
        false
      )
      child.addEventListener(
        'click',
        event => {
          console.log('child捕获')
        },
        true
      )
      child.onclick = function() {
        console.log('child')
      }
* */

/*
* "捕获 "
"child冒泡"
"child捕获"
"child"
"冒泡"
* */
