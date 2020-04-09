> 记录一下leetcode的刷题之旅，坚持每一周整理一篇做题笔记吧，坚持刷题奥利给。


## 设计和实现一个LRU (最近最少使用) 缓存机制
### 运用你所掌握的数据结构，设计和实现一个  LRU (最近最少使用) 缓存机制。它应该支持以下操作： 获取数据 get 和 写入数据 put 。
获取数据 get(key) - 如果密钥 (key) 存在于缓存中，则获取密钥的值（总是正数），否则返回 -1。
写入数据 put(key, value) - 如果密钥不存在，则写入（设置或插入）其数据值。当缓存容量达到上限时，它应该在写入新数据之前删除最久未使用的数据值，从而为新的数据值留出空间
>可以通过数组也可以通过es6的map来实现，注意的是每次获取值时都要把旧的值删除在栈顶重新插入值。[**链接**](https://leetcode-cn.com/problems/lru-cache/ "Html")

```js
/**
 * @param {number} capacity
 */
var LRUCache = function(capacity) {
  this.capacity = capacity
  this.map = new Map()
};

/**
 * @param {number} key
 * @return {number}
 */
LRUCache.prototype.get = function(key) {
  if(this.map.has(key)){
    // 如果已经存在先获取值 先删除旧的key 在栈顶添加当前元素
    const temp = this.map.get(key)
    this.map.delete(key)
    this.map.set(key, temp)
    return temp
  }else {
    return -1
  }
};

/**
 * @param {number} key
 * @param {number} value
 * @return {void}
 */
LRUCache.prototype.put = function(key, value) {
  if(this.map.has(key)){
    this.map.delete(key)
  }
  this.map.set(key, value)
  while(this.map.size > this.capacity){
    const key = this.map.keys()
    // .next是一个迭代函数
    this.map.delete(key.next().value)
  }
};
```

## 全排列
### 给定一个 没有重复 数字的序列，返回其所有可能的全排列。
示例:
输入: [1,2,3]
输出:
[
  [1,2,3],
  [1,3,2],
  [2,1,3],
  [2,3,1],
  [3,1,2],
  [3,2,1]
]
> 回溯法：核心就是通过一个数组保存每次循环的值，当没有元素插入时就进行保存。每次循环之后把栈顶的元素删除，回到上一部操作。[**链接**](https://leetcode-cn.com/problems/permutations "Html")

```js
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {

  // 回溯法
  const result = []
  const temp = []

  function getAll(tempArray){
    if(tempArray.length === 0){
      // 数组没有元素说明排列完了 把当前的temp push进result
      result.push(temp.slice())
      // 回溯
    }else {
      // 还有元素 继续循环
      for(let i = 0; i < tempArray.length; i++){
        // 拷贝一个用于下面的 splice去除当前插入的元素
        const curArray = tempArray.slice()
        // 把当前元素插入到temp的中间数组中
        temp.push(curArray[i])
        // 在数组中删除插入的元素继续递归
        curArray.splice(i,1)
        getAll(curArray)
        // 每次执行之后记得回溯temp插入的变量
        temp.pop()
      }
    }
  }

  getAll(nums.slice())
  return result
};

```
## 子集
### 给定一组不含重复元素的整数数组 nums，返回该数组所有可能的子集（幂集）。说明：解集不能包含重复的子集。
>也是回溯法，与上面的全排列不一样的是，每当插入一个元素就需要保存数组结果吗，知道循环结束，回溯的标志就是剩余数组长度为0。[**链接**](https://leetcode-cn.com/problems/permutations "Html")

```js
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var subsets = function(nums) {
  const result = []
  const temp = []

  function getSets(array) {
    // 不管有没有 当前temp都是一个子集直接插入
    result.push(temp.slice())
    if(array.length !== 0){
      // 还有
      for(let i =0; i< array.length; i++){
        //  先插入当前元素
        temp.push(array[i])
        // 继续递归  洗一次的array拿的是当前元素之后的数组
        getSets(array.slice(i+1, array.length))
        // 递归完成 回溯
        temp.pop()
      }
    }
  }
  getSets(nums)
  return result
};

```

## 有效的括号
### 给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串，判断字符串是否有效。
有效字符串需满足：
1. 左括号必须用相同类型的右括号闭合。
2. 左括号必须以正确的顺序闭合。
3. 注意空字符串可被认为是有效字符串。
>通过一个栈来进行维护，对于左符号直接丢进栈中，循环到又符号的话取出栈顶元素是否相对称即可。最后判断栈中是否还有元素有的话那么久无法匹配。[**链接**](https://leetcode-cn.com/problems/valid-parentheses "Html")

```js
/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {

  //其实就是一个栈的模拟 对于每次遇到一个又符号那么拿出栈订的元素进行匹配
  if(s.length % 2 === 1) return false


  const directionMap = {
    '(' : 'left',
    '{' : 'left',
    '[' : 'left',
    ')' : 'right',
    '}' : 'right',
    ']' : 'right',
  }
  const rightMap = {
    '(' : ')',
    '{' : '}',
    '[' : ']'
  }
  const result = []
  for(let i=0; i< s.length; i++){
    if(directionMap[s[i]] === 'left'){
      result.push(s[i])
    }else {
      if(rightMap[result.pop()] !== s[i]) return false
    }
  }
  // 数组还有元素没被清空那么就是没有匹配完 返回false
  return !result.length
};
```

## 二叉搜索树的最近公共祖先
### 给定一个二叉搜索树, 找到该树中两个指定节点的最近公共祖先。
输入: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8。输出: 6。解释: 节点 2 和节点 8 的最近公共祖先是 6。
>如果qp都大于当前节点，说明公共祖先在父节点的右节点上；如果qp都小于于当前节点，说明公共祖先在父节点的左节点上。其余情况都认为当前节点就是公共祖先节点。[**链接**](https://leetcode-cn.com/problems/lowest-common-ancestor-of-a-binary-search-tree "Html")

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {TreeNode}
 */
var lowestCommonAncestor = function(root, p, q) {
  // 因为对于二叉搜索树来说 左边节点比父节点小 ，有节点比父节点大
  // 对于pq来说 pq都比父节点小 ，那么从node.left继续查找
  // pq都比父节点大 ，那么从node.right继续查找
  // 查找到一个节点比当前节点大一个比当前节点小那么就是公共祖先

  if(p.val > root.val && q.val > root.val){
    // 都比root大往右边找
    return lowestCommonAncestor(root.right, p,q)
  }else if(p.val < root.val && q.val < root.val){
    // 都小
    return lowestCommonAncestor(root.left, p,q)
  }else {
    // 一大一小
    return root
  }
};
```

## 155. 最小栈
### 设计一个支持 push ，pop ，top 操作，并能在常数时间内检索到最小元素的栈。
>通过一个数组来模拟栈即可，同时保存一个min变量用来保存最小元素。[**链接**](https://leetcode-cn.com/problems/min-stack "Html")

```js
/**
 * initialize your data structure here.
 */
var MinStack = function() {
  this.stack = []
  this.min = Infinity
  return this
};

/**
 * @param {number} x
 * @return {void}
 */
MinStack.prototype.push = function(x) {
  this.stack.push(x)
  this.min = Math.min(x, this.min)
};

/**
 * @return {void}
 */
MinStack.prototype.pop = function() {
  const val = this.stack.pop()
  if(val === this.min){
    // 删除的是最小值重新计算
    this.min = Math.min(...this.stack)
  }
  return val
};

/**
 * @return {number}
 */
MinStack.prototype.top = function() {
  return this.stack[this.stack.length -1]
};

/**
 * @return {number}
 */
MinStack.prototype.getMin = function() {
  return this.min
};
```

## 第k个排列
### 给出集合 [1,2,3,…,n]，其所有元素共有 n! 种排列。给定 n 和 k，返回第 k 个排列。
给定3和3.按大小顺序列出所有排列情况，并一一标记，当 n = 3 时, 所有排列如下：
"123","132","213","231","312","321"。即返回213

> 这里给出的方法是比较笨的方法，其实可以通过阶乘数字大小来推断出当前位数以及具体数字的。[**链接**](https://leetcode-cn.com/problems/permutation-sequence "Html")

```js
// 比较笨的本法列出所有的排列 不太可取。可以通过阶乘知道其实位置是多少
/**
 * @param {number} n
 * @param {number} k
 * @return {string}
 */
var getPermutation = function(n, k) {
  const nArray = Array.from({length: n}).fill(0).map((item, index) => index+1)
  const result = []
  const temp = []

  function getAll(tempArray){
    // 长度满足了 直接退出 不然容易超时
    if(result.length === k) return
    if(tempArray.length === 0){
      // 排列完了 直接丢入result
      result.push(temp.slice())
    }else {
      // 还有元素
      for(let i =0; i< tempArray.length; i++){
        // 插入当前元素
        temp.push(tempArray[i])
        // 继续递归
        const curArray = tempArray.slice()
        curArray.splice(i,1)
        getAll(curArray)
        // 回溯
        temp.pop()
      }
    }
  }
  getAll(nArray)
  return result[k-1].join('')
};

```
