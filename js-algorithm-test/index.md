>本文是在[**ConardLi的【前端该如何准备数据结构和算法？】总结而来**](https://juejin.im/post/5d5b307b5188253da24d3cd1 "Markdown"),代码实现上是我自己使用ts编写，题目均是跟着上文编写。
## 数据结构

### 什么是数据结构
数据结构是在计算机中组织和存储数据的一种特殊方式，使得数据可以高效地被访问和修改。更确切地说，数据结构是数据值的集合，表示数据之间的关系，也包括了作用在数据上的函数或操作

### 常见的数据结构
1. 数组：Array
2. 堆栈：Stack
3. 队列：Queue
4. 链表：Linked Lists
5. 树：Trees
6. 图：Graphs
7. 字典树：Trie
8. 散列表（哈希表）：Hash Tables

## 数组
不用说，数组应该是最熟悉的数据结构，在日常的开发中都有遇到。用于按顺序存储元素的集合。但是元素可以随机存取，因为数组中的每个元素都可以通过数组索引来识别。插入和删除时要移动后续元素，还要考虑扩容问题，插入慢。数组的结构与链表十分相似，但是其实两者是有区别的。

1. 数组在内存中是连续的，属于线性存储，数组通过索引的访问速度很快，但是数组的插入或者删除都要移动所有的后续元素，所以数组更适合于那种一次创建频繁访问的业务中。
2. 链表在内存中不一定是连续的，属于链性存储。链表一般通过.next来指向下一个元素。因为链表的非连续特性，链表的访问性能并不高（需要通过.next.next来访问），但是对于插入和删除元素却得心应手。因为链表内存中是非连续的，插入新元素直接断开节点重新插入节点即可，后续元素并不用进行移动。

### 把数组排成最小的数
#### 输入一个正整数数组，把数组里所有数字拼接起来排成一个数，打印能拼接出的所有数字中最小的一个。例如输入数组{3，32，321}，则打印出这三个数字能排成的最小数字为321323
>对于任意的数字a,b只有两种组合情况ab和ba,如果ab>ba的话那么ba就排在前面，确保最小。数字的大小比较我们可以通过js中的sort函数进行比较即可。
```ts
/**
 * 把数组排成获取最小数字
 * @param {number[]} numbers
 * @returns {string}
 */
function getMinNumber(numbers: number[]): string {
  if (Array.isArray(numbers) && numbers.length) {
    //字符串比较同列字符串大小
    return numbers.sort((a, b) => {
      const front = String(a) + b
      const behind = String(b) + a
      return (front as any - (behind as any))
    }).join('')
  }
  return ''
}

```
### 第一个只出现一次的字符
#### 在一个字符串(0<=字符串长度<=10000，全部由字母组成)中找到第一个只出现一次的字符,并返回它的位置, 如果没有则返回-1（需要区分大小写）。
>使用一个对象保存相应字母出现的次数,再一次遍历字符串获取对象中为第一个为1的索引值
```ts
interface StringMap {
  [key: string]: number
}

/**
 * 获取字符串中第一个只出现1次的字母
 * @param {string} str
 * @returns {number}
 */
function getFirstString(str: string): number {
  if (!str) return -1
  const strMap: StringMap = {}
  for (let i = 0; i < str.length; i++) {
    const key: keyof StringMap = str[i]
    strMap[key] = strMap[key] ? (strMap[key] + 1) : 1
  }
  // 筛选出第一个1的值
  for (let i = 0; i < str.length; i++) {
    if (strMap[str[i]] === 1) {
      return i
    }
  }
}
```

### 调整数组顺序使奇数位于偶数前面
#### 输入一个整数数组，实现一个函数来调整该数组中数字的顺序，使得所有的奇数位于数组的前半部分，所有的偶数位于数组的后半部分
>使用双指针，首尾开始循环遍历，如有尾部遍历是查到了基数头部遍历到偶数时，进行两个位置的交换直到首尾指针到同一个位置就停止
```ts
/**
 * 排序数组基数全部在前面偶数在后面
 * @param {number[]} array
 * @returns {number[]}
 */
function formatOrderArray(array: number[]): number[] {
  let start = 0
  let end = array.length - 1
  // 不相等一直循环
  while (start < end) {
    while (array[start] % 2 === 1) {
      // 如果头部查找到的是基数继续循环 偶数就退出
      start++
    }
    while (array[end] % 2 === 0) {
      // 同理 如果尾部查找到的是偶数继续循环 基数就退出
      end--
    }

    // 在这里已经都找到奇偶数了，但是需要注意一点就是此时可能 start >end了 因为一直在递增所以这里多加个判断
    if (start < end) {
      [array[start], array[end]] = [array[end], array[start]]
    }
  }
  return array
}
```

### 和为S的连续正整数序列
#### 输入一个正数S，打印出所有和为S的连续正数序列。例如：输入15，有序1+2+3+4+5 = 4+5+6 = 7+8 = 15 所以打印出3个连续序列1-5，5-6和7-8。
>又是一个双指针的一道题
1. 创建一个容器child，用于表示当前的子序列，初始元素为1,2.
2. 记录子序列的开头元素small和末尾元素big.(small 默认为1 big默认为2)
3. big向右移动子序列末尾增加一个数 small向右移动子序列开头减少一个数.
4. 当子序列的和大于目标值，small向右移动，子序列的和小于目标值，big向右移动.
解释：先判断[1,2]的总值是否小于给定的值S，如果小于的话说明还需要增加一个数这时候把3加入变成[1,2,3]。这时候再判断直到总值大于等于S。接下来继续循环，如果总之大于S的话，那么就把末尾的值删除一个，直到总之值小于等于S。最后的时候判断和是否等于S，不是的话会继续回调到上面加数字的步骤。等于值的话保存起来，并且加上一个大数继续循环，直到大数大于等于S就退出循环。
```ts
/**
 * 获取和为s的连续数组
 * @param {number} sum
 * @returns {number[][]}
 * @constructor
 */
function FindContinuousSequence(sum: number): number[][] {
  // 结果二维数组
  const result = []
  // 用来放置连续数据的数组
  const child = [1, 2]
  // 初始化最小值最大值
  let small = child[0]
  let big = child[1]
  // 初始化总值
  let total = 3
  // 开始循环
  while (big < sum) {
    while (total < sum && big < sum) {
      // 总值小于sum，在末尾插入一个big+1的数字
      big += 1
      total += big
      child.push(big)
    }
    // 大于等于sum了退出循环

    while (total > sum && small < big) {
      // 总值大于sum，把尾部的small值+1 并且删除child头部的值
      total -= small
      child.shift()
      small += 1
    }
    // 这时候total值小于等于sum 如果等于的话会进入下面的判断 小于的话会重新进行total<sum的循环
    if (total === sum && child.length > 1) {
      // 等于值保存 拷贝新数组
      result.push(child.concat())
      // 插入一个值继续进行大数循环
      big += 1
      total += big
      child.push(big)
    }
  }
  return result
}
```

### 和为S的两个数字
#### 输入一个递增排序的数组和一个数字S，在数组中查找两个数，使得他们的和正好是S，如果有多对数字的和等于S，输出两个数的乘积最小的.
>又是双指针的经典题
1. 先排序。首尾两个元素相加,这里设为T。T跟S有三种情况。
2. 如果T大于S说明数字大了右边的指针向左边移动一个。继续比较
3. 如果T小于于S说明数字小了做边的指针向又边移动一个。继续比较
4. T等于S，命中了。保存这两个值以及乘计，然后首尾都移动一格继续比较
5. 首部start >= 尾部end退出循环
```ts
/**
 * 排序数组获取何为s的两个值
 * @param {number[]} array
 * @param {number} sum
 * @returns {number[] | null}
 */
function getTotalArray(array: number[], sum: number): number[] | null {
  // 初始化头尾
  let start = 0
  let end = array.length - 1
  // 初始化存储数组
  let result: number[] | null = null

  const sortArray = array.sort((a, b) => a - b)
  while (start < end) {
    const startVal = sortArray[start]
    const endVal = sortArray[end]
    const totalVal = startVal + endVal
    if (totalVal - sum > 0) {
      // 数字大了 尾部向左移动一格
      end -= 1
    } else if (totalVal - sum < 0) {
      // 数字笑了， 头部向右移动一格
      start += 1
    } else {
      // 相等 保存值
      if (Array.isArray(result)) {
        const [start, end] = result
        if ((startVal * endVal - start * end) < 0) {
          // 乘积比较小
          result = [startVal, endVal]
        }
      } else {
        result = [startVal, endVal]
      }
    }
  }
  return result
}
```

### 连续子数组的最大和
#### 输入一个整型数组，数组里有正数也有负数。数组中的一个或连续多个整数组成一个子数组。求所有子数组的和的最大值，要求时间复杂度为O(n)
>首先核心的部分就是如何界定数组的边界索引。假设我们从左到右开始计算和，如果和大于0就表明前面的边界对后面是有贡献的那么就需要保留并且记录当前索引的值为左边界以及当前和的值，继续进行累加如果累加值大于最大值max，那么就记录累加值为max继续比较并且当前索引值就是右边界
1. 记录一个当前连续子数组最大值 max 默认值为数组第一项，左边界索引为0.
2. 记录一个当前连续子数组累加值 sum 默认值为数组第一项，右边界索引为1.
3. 从数组第二个数开始，若 sum<0 则当前的sum不再对后面的累加有贡献，sum = 当前数
4. 若 sum>0 则sum = sum + 当前数
5. 比较 sum 和 max ，max = 两者最大值
```ts
/**
 * 连续子数组的最大和以及最大和数组
 * @param {number[]} array
 * @returns {{max: number, maxArray: number[]}}
 */
function getTotalMaxArray(array: number[]): { max: number, maxArray: number[] } {
  // 定义累加值
  let sum = array[0]
  // 定义最大值
  let max = array[0]
  // 定义临时变量用于保存左边界值
  let zeroIndex = 0
  // 定义左边界
  let leftIndex = 0
  // 定义右边界
  let rightIndex = array.length
  for (let i = 1; i <= (array.length - 1); i++) {
    if (sum < 0) {
      // 累加值小于0对于后续的数组其实是没有用的所以去掉
      sum = array[i]
      zeroIndex = i
    } else {
      sum += array[i]
    }

    if (sum > max) {
      // 如果累加值大于当前的最大值的话 相当于是加了个整数的话
      max = sum
      // 左边界指向当前临时左边界的索引
      leftIndex = zeroIndex
      // 右边界指向当前index
      rightIndex = i + 1
    }
  }
  const maxArray = array.slice(leftIndex, rightIndex)
  return {
    max,
    maxArray
  }
}
```

### 两数之和
#### 给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回他们的数组下标。你可以假设每种输入只会对应一个答案。但是，你不能重复利用这个数组中同样的元素。
>好像是leetCode第一题，两次循环暴力穷举复杂度是O(n2)。其实可以通过一个map对象来获取减法的需要值，复杂度降低到O(n)
```ts
interface GetTwoSumMap {
  [keys: number]: number
}

/**
 * 两数之和
 * @param {number[]} array
 * @param {number} sum
 * @returns {number[]}
 */
function getTwoSum(array: number[], sum: number): number[] {
  const map: GetTwoSumMap = {}
  for (let i = 0; i < array.length; i++) {
    const remainVal: keyof GetTwoSumMap = sum - array[i]
    if (map[remainVal] !== undefined) {
      // 如果map中有这个值了 返回两个索引即可
      return [map[remainVal], i]
    } else {
      // map中找不到 把当前值添加进map
      map[array[i]] = i
    }
  }
  return []
}
```

### 扑克牌顺子
#### 扑克牌中随机抽5张牌，判断是不是一个顺子，即这5张牌是不是连续的。2-10为数字本身，A为1，J为11...大小王可以看成任何数字，可以把它当作0处理。
>核心思想就是因为大小王能够用作任意数字，所以只需要计算出剩余牌的相差值小于等于大小王的数量即可视为顺子
1. 首先对牌进行排序
2. 计算出大小王的数量，就是获取0的数量
3. 循环获取剩余牌的间隔值，间隔值大于0的数量那么认为无法顺子
4. 有两张牌相等就认为不能成为顺子
```ts
/**
 * 检查牌是否顺子
 * @param {number[]} array
 * @returns {boolean}
 */
function isContinuePocker(array: number[]): boolean {
  const sortArray = array.sort((a, b) => a - b)
  let jokerNum = 0
  let spaceNum = 0
  for (let i = 0; i < sortArray.length - 1; i++) {
    if (array[i] === 0) {
      jokerNum += 1
    } else {
      const space = array[i + 1] - array[i]
      if (space === 0) return false
      spaceNum += space - 1
    }
  }
  return jokerNum >= spaceNum
}
```

### 三数之和
### 给定一个包含 n 个整数的数组nums，判断 nums 中是否存在三个元素a，b，c ，使得 a + b + c = 0 ？找出所有满足条件且不重复的三元组。
>我们可以对数组新进行排序，然后遍历一个数a,那么求值的操作就可以转化为上面的求和为-a的两个数。
1. 首先对牌进行排序
2. 开始进行遍历a，取后面的剩余数组进行遍历求和-a(这里只需要遍历后续数组的原因是因为，前面的已经计算过和了，不需要再重新进行计算)
3. 转化为两数之和，使用双指针进行计算，如果当前a值与上一个值相同直接跳过。
```ts
/**
 * 三数相加
 * @param {number[]} array
 * @returns {number[][]}
 */
function threeNumberSum(array: number[]): number[][] {
  const cacheArray: number[][] = []
  const sortArray = array.sort((a, b) => a - b)
  for (let i = 0; i < sortArray.length; i++) {
    let start = i + 1
    let end = sortArray.length - 1
    if (i > 0 && sortArray[i] !== sortArray[i - 1]) {
      //只有在i大于0 并且不等于上一个数才进行求值
      while (start < end) {
        //大于
        if (sortArray[start] + sortArray[end] > -sortArray[i]) {
          // 右边左移
          end -= 1
        } else if (sortArray[start] + sortArray[end] < -sortArray[i]) {
          //小于 左边右移
          start += 1
        } else {
          // 相等 插入 然后都移动继续循环
          cacheArray.push([sortArray[i], sortArray[start], sortArray[end]])
          end -= 1
          start += 1
        }
      }
    }
  }
  return cacheArray
}
```

### 顺时针打印矩阵
#### 输入一个矩阵，按照从外向里以顺时针的顺序依次打印出每一个数字。例如，如果输入如下4 X 4矩阵：[[1 2 3 4],[5 6 7 8],[9 10 11 12 ], [13 14 15 16 ]]。则依次打印出数字1,2,3,4,8,12,16,15,14,13,9,5,6,7,11,10。
>假设起点是(start, start)，那么没走完一个圈，下一个起点就是(start +1, start +1),所以循环的结束条件是start都大于宽高的一半，即start*2 > row && start* 2> column
--------------7----------------
1. 设起点坐标为(start,start)，矩阵的行数为rows，矩阵的列数为columns,将打印一圈拆解为四部.
2. 第一步：从左到右打印一行
3. 第二步：从上到下打印一列
4. 第三步：从右到左打印一行
5. 第四步：从下到上打印一列
6. 注意的是最后一圈会有三种情况，首先还有圈的话那么从左向右是一定有的。
7. 如果当前start*2 < 列数column 说明还可以上到下
8. 如果当前start*2 < 行数row 说明还可以右到左
9. 如果当前start*2 + 1 < 列数column 说明还可以下到上
-------------8----------------------
```ts
/**
 * 顺时针顺序打印矩形数组
 * @param {number[][]} matrix
 * @returns {number[]}
 */
function getMatrixNum(matrix: number[][]): number[] {
  if(!matrix.length)return []
  const column = matrix.length
  const row = matrix[0].length
  const result: number[] = []
  //初始位置
  let start = 1
  // 如果start *2 > column && start *2>row的时候退出循环
  while ((start -1) * 2 < row && (start -1) * 2 < column) {
    //首先右到左肯定是有的
    for (let i = start - 1; i <= row - start; i++) {
      result.push(matrix[start - 1][i])
    }
    // 从上到下
    if (start * 2 <= column) {
      for (let k = start; k <= column - start; k++) {
        result.push(matrix[k][row - start])
      }
    }
    // 从右到左
    if (start * 2 <= column && start * 2 <= row) {
      for (let i = row - start; i >= start; i--) {
        result.push(matrix[column - start][i -1])
      }
      // 从上到下
      if (start * 2 + 1 <= column) {
        for (let i = column - start; i > start; i--) {
          result.push(matrix[i -1][start - 1])
        }
      }
    }

    start += 1
  }
  return result
}

```

## 链表
链表存储有序的元素集合，但不同于数组，链表中的元素在内存中并不是连续放置的。每个元素由一个存储元素本身的节点和一个指向下一个元素的引用（也称指针或链接）组成。下图展 示了一个链表的结构。
相对于传统的数组，链表的一个好处在于，添加或移除元素的时候不需要移动其他元素。然而，链表需要使用指针，因此实现链表时需要额外注意。在数组中，我们可以直接访问任何位置 的任何元素，而要想访问链表中间的一个元素，则需要从起点（表头）开始迭代链表直到找到所需的元素。
------------------9-------------------------------------
在react fiber和react hooks中用到的大量的链表结构，其中fiber node是一条双向链表（通过child指向子节点，sibling指向兄弟节点，通过return返回父节点）。react hooks是单向链表，hooks内部的update对象queue则是单向循环链表。

### 从尾到头打印链表
#### 输入一个链表，按链表值从尾到头的顺序返回一个ArrayList
>通过递归.next获取下一个链表，直到.next为null

```ts
interface List {
  next: List | null,
  val: string
}

/**
 * 从尾部到头部打印链表
 * @param {List} list
 * @returns {string[]}
 */
function printList(list: List) {
  const array = []
  while (list) {
    array.unshift(list.val)
    list = list.next
  }
  return array
}
```

### 反转链表
#### 输入一个链表，反转链表后，输出新链表的表头。

1. 每一次循环的本质就是一直保留头部第一个链表head（这里是a1）,每次循环的时候把第二个之后的链表拿出来currentNode (这里是a2-n)拿出来,之后把头部head（a1）链表执向a2-n的下一个即a3-n所以头部链表head就变成了(a1.next => a3-n)。这时候注意因为一开始headNode跟head的引用是相同的所以这时候headNode也是(a1.next => a3-n)。最后把currentNode.next执向headNode所以就变成了(a2.next=>a1.next => a3-n)
2. head == a1.next =>a3.next.... currentNode === headNode === a2.next => a1.next => a3.next...
3. 从上面可以看出headNode跟head之间是有引用关系的即(headNode.next === head),两者引用是相同的。所以修改head的引用值也会改变headNode.next的引用值
2. 继续循环,注意下面两句
```js
  // 第三点 headNodg跟head的引用是有联系的
  let headNode = head;
  // 这里修改了head引用，所以headNode也会发生改变
  // a1.next => a4.next =>a5
  // 所以 headNode.next === a1.next => a4.next =>a5 最终就是 a3.next =>a2.next =>a1.next => a4.next =>a5
  head.next = currentNode.next;
  currentNode.next = headNode;

```
解答:   
```ts
function reverseList(head: List): List {
  let headNode = head
  let currentNode = null
  while (head && head.next) {
    // 获取第二个链表
    currentNode = head.next
    //head的下一个链表指向下下一个即第三个
    head.next = currentNode.next
    // 第二个链表指向头部链表
    currentNode.next = headNode

    headNode = currentNode
  }
  return headNode
}
```

### 链表倒数第k个节点
#### 输入一个链表，输出该链表中倒数第k个结点。
>如果先循环出链表的所有长度在进行求值的话，需要循环两次复杂度为2n。可以使用双指针进行优化
1. 初始指针a,第二个指针b与指针a间隔为k
2. 这时候两个指针都进行循环，如果b指针到达终点了，那么a指针当前位置就是倒数第k个节点位置
```ts
 * 获取倒数第n个节点的链表
 * @param {List} list
 * @param {number} k
 * @returns {string | null}
 */
function getLastListVal(list: List, k: number): string | null {
  if (Number(k) > 0) {
    let slow = list
    let fast = list
    let index = 1
    while (fast && fast.next) {
      fast = fast.next
      if (index >= k) {
        slow = slow.next
      }
      index++
    }
    return index < k ? null : slow.val
  } else {
    return null
  }
}
```

### 链表中环的入口节点（查找链表是否有环）
#### 给一个链表，若其中包含环，请找出该链表的环的入口结点，否则，输出null。
>问题可以拆分成两部分1如果判断链表是否有环，第二个如何查找环的起点。
1. 如何判断链表是否有环：我们只需要两个指针，一个走一步，一个走两步，只要指针有相遇的话那么就是有环。（假设链表没有环的话，那么因为快指针走的越来越远那么两个指针永远不可能相遇。如果链表有环，假设快慢指针都在环里面，如果以慢指针作为参考物，那么快指针每次走一步，如果有环的话，那么两个指针最终一定会相遇）
2. 如何判断环的起点。首先我们假设有两个指针都在环的起点，如果让某一个指针先走环的长度K，那么该指针还是会回到环的起点与另一个指针相遇。这时候快的指针相对于慢的指针其实是先走了K步，这时候快的指针相对于慢的指针先走了环的长度k步。我们再把两个指针平移同样的步数直到慢的起点。所以最终判断环的起点问题可以转化为：两个指针a,b。a在起点，b先走环的长度，如果a和b相遇了那么当前位置就是环的起点入口。
3. 环的长度可以通过在环内的一点每次走一步又走到当前点的话，那么走的步数就是环的长度。

```ts
function getListStart(list: List): List | null {
  // 首先判断链表是否有环
  // 慢的先走1步
  let slow = list.next
  // 快的先走两步
  let fast = list.next.next

  // 初始化环的长度
  let squareLength = 0
  while(fast !== slow) {
    if(fast && fast.next){
      fast = fast.next.next
      slow = slow.next
    }else {
      // 快指针已经到终点了还没遇到那么久没有环
      return null
    }
  }
  
  // 有环 这里需要拿环的长度 此时 fast和slow必定在环内
  slow = slow.next
  squareLength +=1
  while(slow !== fast) {
    slow = slow.next
    squareLength +=1
  }
  // 都回到原点
  slow = list
  fast = list
  // 快指针先走环的长度步数
  for(let i =1; i <= squareLength; i++){
    fast = fast.next
  }
  //获取环的起点
  while(slow !== fast) {
    slow = slow.next
    fast = fast.next
  }
  return slow
}
```

### 两个链表的第一个公共节点
#### 输入两个链表，找出它们的第一个公共结点。
>假设两个公共链表有公共节点，那么从这节点开始后续的元素位置相同并且长度必须相等合并成一条线，所以我们两条链表的尾部对齐，长一点的链表pass掉差异的长度，然后依次比较是否相等即可。
1. 通过循环获取链表的长度。
2. 获取长的链表先走长度的差异值步
3. 同时循环查找是否有相等的节点，有的话就是公共节点
```ts
function getFirstCommonNode(a: List, b: List): List | null {
  if (!a || !b) {
    return null;
  }

  //获取链表长度
  function getListLength(list: List) {
    let listLength = 0;
    while (list) {
      listLength += 1;
      list = list.next;
    }
    return listLength;
  }
  const aLength = getListLength(a);
  const bLength = getListLength(b);

  let long = aLength > bLength ? a : b;
  let short = aLength > bLength ? b : a;

  // 长的链表跳过长度差异
  for (let i = 0; i < Math.abs(aLength - bLength); i++) {
    long = long.next;
  }

  while (short && long) {
    if (short === long) {
      return short;
    }
    short = short.next;
    long = long.next;
  }
  return null;
}
```

### 约瑟夫环
#### 0,1,...,n-1这n个数字排成一个圆圈，从数字0开始，每次从这个圆圈里删除第m个数字。求出这个圆圈里剩下的最后一个数字。
>约瑟夫环总共有三种做法：1通过链表循环删除对应的节点，2通过数组取值使用索引，3通过递归。
1. 使用链表，我们只需要把元素组装成一个链表，然后通过循环没过m个节点删除元素即可，直到只剩下一个元素
2. 通过描述我们可以得出一条规律：从当前某个元素开始数，下一个被删除的数字等于m除以总人数的余数，假设第1次删除的数字是：第一个数字0开始数起的第m个数。举个例子：假设m是2，总人数是10,那么第(2 % 10) = 2第二个数字要被删除。对应索引的话就得到删除的索引Index = ((m)% n) -1。我们可以通过数组去循环即可。
3. d动态规划: 
 1. 第一轮的时候第一个被删除索引是(m-1)%n。所以第二轮的开始（0）位置索引就是m%n,所以推导出第二轮第k个位置在第1轮的索引就是(m+k)%n。
 2. 假设在第n轮时候的某个人位置是f(n)，那么第n-1轮的时候位置其实就是f(n-1) = (m+f(n))%n。即第7轮某个人位置是2 那么第6轮他的位置就是(m+ 2)%n, 那么第五轮他的位置就是(m + ((m+ 2)%n))%n。
 3. 现在我们知道8个人时，最后一轮就是第七轮因为每一轮走一个人此时剩下的人索引就是0，所以上一轮他的位置就是(m+2)%8,因此我们可以一直循环上去直到第一轮就是他获取的位置。
 
```ts
//链表解决
function getRemainPeopleIndexByList(total: number, space: number): number{
  interface List {
    next?: List ;
    val: number;
  }
  const head:List = {val : 0}
  let current: List = head
  for(let i=1; i<total; i++){
    current.next = {val: i}
    current = current.next
  }
  current.next = head
  while (current.next != current) {
    for (let i = 0; i < m - 1; i++) {
      current = current.next;
    }
    current.next = current.next.next;
  }
  return current.val;
}

// 数组
function getRemainPeopleIndexByArray(total: number, space: number): number{
  if (total < 1 || space < 1) {
    return -1;
  }
  const array = [];
  let index = 0;
  for (let i = 0; i < total; i++) {
    array[i] = i;
  }
  while (array.length > 1) {
    index = (index + space) % array.length - 1;
    if (index >= 0) {
      array.splice(index, 1);
    } else {
      array.splice(array.length - 1, 1);
      index = 0;
    }
  }
  return array[0];
}

//动态规划
function getRemainPeopleIndex(total: number, space: number): number {
  // 总共要进行的轮数才剩一人
  let totalLunshu = total - 1
  // 最后第totalLunshu轮时胜利人的索引是0
  let lastPeopleIndex = 0
  // 1. 第一轮的时候第一个被删除索引是(m-1)%n。所以第二轮的开始（0）位置索引就是m%n,所以推导出第二轮第k个位置在第1轮的索引就是(m+k)%n。
  // 2. 假设在第n轮时候的某个人位置是f(n)，那么第n-1轮的时候位置其实就是f(n-1) = (m+f(n))%(total - n)。即第7轮某个人位置是2 那么第6轮他的位置就是(m+ 2)%(total - 6), 那么第五轮他的位置就是(m + ((m+ 2)%n))%n。
  // 3. 现在我们知道8个人时，最后一轮就是第七轮因为每一轮走一个人此时剩下的人索引就是0，所以上一轮他的位置就是(m+2)%8,因此我们可以一直循环上去直到第一轮就是他获取的位置。

  // 一直循环到00位置 走totalLunshu轮
  while(totalLunshu > 0){
    //上一轮的索引 f(n-1) = f(n-1) = (m+f(n))%（每一轮的人数）
    lastPeopleIndex = (space+ lastPeopleIndex) % (total - totalLunshu + 1)
    totalLunshu -=1
  }
  return lastPeopleIndex
}
```

## 堆和栈
堆和栈的数据结构一般都是成双成对，这里就一并讲了吧。
1. 堆的结构类似于图书馆的藏书架子一样，书本整齐的放在书架上，你只需要知道相对应的书架行号和列号，那么就可以直接拿到这本书，类似于对象的数据格式一样 。js中的引用变量都以堆的形式放在内存中。
2. 首先js中JavaScript的执行上下文沿用了栈结构，即我们经常说的执行上下文栈，栈是一个什么样的数据结构呢。简单说就是：先进后出，后进后出。就像高中时化学实验的量筒，假设往量筒中放入乒乓球的模型一样。一号球是最开始放进去的，五号球球是最后放入的。但是如果要把所有球拿出来，那么就是5号球先拿出来，一号球最后，栈就是这种结构。
-----------1----------
