> 本文是在[**ConardLi 的【前端该如何准备数据结构和算法？】总结而来**](https://juejin.im/post/5d5b307b5188253da24d3cd1 "Markdown"),代码实现上是我自己使用 ts 编写，题目均是跟着上文编写。

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
2. 链表在内存中不一定是连续的，属于链性存储。链表一般通过.next 来指向下一个元素。因为链表的非连续特性，链表的访问性能并不高（需要通过.next.next 来访问），但是对于插入和删除元素却得心应手。因为链表内存中是非连续的，插入新元素直接断开节点重新插入节点即可，后续元素并不用进行移动。

### 把数组排成最小的数

#### 输入一个正整数数组，把数组里所有数字拼接起来排成一个数，打印能拼接出的所有数字中最小的一个。例如输入数组{3，32，321}，则打印出这三个数字能排成的最小数字为 321323

> 对于任意的数字 a,b 只有两种组合情况 ab 和 ba,如果 ab>ba 的话那么 ba 就排在前面，确保最小。数字的大小比较我们可以通过 js 中的 sort 函数进行比较即可。

```ts
/**
 * 把数组排成获取最小数字
 * @param {number[]} numbers
 * @returns {string}
 */
function getMinNumber(numbers: number[]): string {
  if (Array.isArray(numbers) && numbers.length) {
    //字符串比较同列字符串大小
    return numbers
      .sort((a, b) => {
        const front = String(a) + b;
        const behind = String(b) + a;
        return (front as any) - (behind as any);
      })
      .join("");
  }
  return "";
}
```

### 第一个只出现一次的字符

#### 在一个字符串(0<=字符串长度<=10000，全部由字母组成)中找到第一个只出现一次的字符,并返回它的位置, 如果没有则返回-1（需要区分大小写）。

> 使用一个对象保存相应字母出现的次数,再一次遍历字符串获取对象中为第一个为 1 的索引值

```ts
interface StringMap {
  [key: string]: number;
}

/**
 * 获取字符串中第一个只出现1次的字母
 * @param {string} str
 * @returns {number}
 */
function getFirstString(str: string): number {
  if (!str) return -1;
  const strMap: StringMap = {};
  for (let i = 0; i < str.length; i++) {
    const key: keyof StringMap = str[i];
    strMap[key] = strMap[key] ? strMap[key] + 1 : 1;
  }
  // 筛选出第一个1的值
  for (let i = 0; i < str.length; i++) {
    if (strMap[str[i]] === 1) {
      return i;
    }
  }
}
```

### 调整数组顺序使奇数位于偶数前面

#### 输入一个整数数组，实现一个函数来调整该数组中数字的顺序，使得所有的奇数位于数组的前半部分，所有的偶数位于数组的后半部分

> 使用双指针，首尾开始循环遍历，如有尾部遍历是查到了基数头部遍历到偶数时，进行两个位置的交换直到首尾指针到同一个位置就停止

```ts
/**
 * 排序数组基数全部在前面偶数在后面
 * @param {number[]} array
 * @returns {number[]}
 */
function formatOrderArray(array: number[]): number[] {
  let start = 0;
  let end = array.length - 1;
  // 不相等一直循环
  while (start < end) {
    while (array[start] % 2 === 1) {
      // 如果头部查找到的是基数继续循环 偶数就退出
      start++;
    }
    while (array[end] % 2 === 0) {
      // 同理 如果尾部查找到的是偶数继续循环 基数就退出
      end--;
    }

    // 在这里已经都找到奇偶数了，但是需要注意一点就是此时可能 start >end了 因为一直在递增所以这里多加个判断
    if (start < end) {
      [array[start], array[end]] = [array[end], array[start]];
    }
  }
  return array;
}
```

### 和为 S 的连续正整数序列

#### 输入一个正数 S，打印出所有和为 S 的连续正数序列。例如：输入 15，有序 1+2+3+4+5 = 4+5+6 = 7+8 = 15 所以打印出 3 个连续序列 1-5，5-6 和 7-8。

> 又是一个双指针的一道题

1. 创建一个容器 child，用于表示当前的子序列，初始元素为 1,2.
2. 记录子序列的开头元素 small 和末尾元素 big.(small 默认为 1 big 默认为 2)
3. big 向右移动子序列末尾增加一个数 small 向右移动子序列开头减少一个数.
4. 当子序列的和大于目标值，small 向右移动，子序列的和小于目标值，big 向右移动.
   解释：先判断[1,2]的总值是否小于给定的值 S，如果小于的话说明还需要增加一个数这时候把 3 加入变成[1,2,3]。这时候再判断直到总值大于等于 S。接下来继续循环，如果总之大于 S 的话，那么就把末尾的值删除一个，直到总之值小于等于 S。最后的时候判断和是否等于 S，不是的话会继续回调到上面加数字的步骤。等于值的话保存起来，并且加上一个大数继续循环，直到大数大于等于 S 就退出循环。

```ts
/**
 * 获取和为s的连续数组
 * @param {number} sum
 * @returns {number[][]}
 * @constructor
 */
function FindContinuousSequence(sum: number): number[][] {
  // 结果二维数组
  const result = [];
  // 用来放置连续数据的数组
  const child = [1, 2];
  // 初始化最小值最大值
  let small = child[0];
  let big = child[1];
  // 初始化总值
  let total = 3;
  // 开始循环
  while (big < sum) {
    while (total < sum && big < sum) {
      // 总值小于sum，在末尾插入一个big+1的数字
      big += 1;
      total += big;
      child.push(big);
    }
    // 大于等于sum了退出循环

    while (total > sum && small < big) {
      // 总值大于sum，把尾部的small值+1 并且删除child头部的值
      total -= small;
      child.shift();
      small += 1;
    }
    // 这时候total值小于等于sum 如果等于的话会进入下面的判断 小于的话会重新进行total<sum的循环
    if (total === sum && child.length > 1) {
      // 等于值保存 拷贝新数组
      result.push(child.concat());
      // 插入一个值继续进行大数循环
      big += 1;
      total += big;
      child.push(big);
    }
  }
  return result;
}
```

### 和为 S 的两个数字

#### 输入一个递增排序的数组和一个数字 S，在数组中查找两个数，使得他们的和正好是 S，如果有多对数字的和等于 S，输出两个数的乘积最小的.

> 又是双指针的经典题

1. 先排序。首尾两个元素相加,这里设为 T。T 跟 S 有三种情况。
2. 如果 T 大于 S 说明数字大了右边的指针向左边移动一个。继续比较
3. 如果 T 小于于 S 说明数字小了做边的指针向又边移动一个。继续比较
4. T 等于 S，命中了。保存这两个值以及乘计，然后首尾都移动一格继续比较
5. 首部 start >= 尾部 end 退出循环

```ts
/**
 * 排序数组获取何为s的两个值
 * @param {number[]} array
 * @param {number} sum
 * @returns {number[] | null}
 */
function getTotalArray(array: number[], sum: number): number[] | null {
  // 初始化头尾
  let start = 0;
  let end = array.length - 1;
  // 初始化存储数组
  let result: number[] | null = null;

  const sortArray = array.sort((a, b) => a - b);
  while (start < end) {
    const startVal = sortArray[start];
    const endVal = sortArray[end];
    const totalVal = startVal + endVal;
    if (totalVal - sum > 0) {
      // 数字大了 尾部向左移动一格
      end -= 1;
    } else if (totalVal - sum < 0) {
      // 数字笑了， 头部向右移动一格
      start += 1;
    } else {
      // 相等 保存值
      if (Array.isArray(result)) {
        const [start, end] = result;
        if (startVal * endVal - start * end < 0) {
          // 乘积比较小
          result = [startVal, endVal];
        }
      } else {
        result = [startVal, endVal];
      }
    }
  }
  return result;
}
```

### 连续子数组的最大和

#### 输入一个整型数组，数组里有正数也有负数。数组中的一个或连续多个整数组成一个子数组。求所有子数组的和的最大值，要求时间复杂度为 O(n)

> 首先核心的部分就是如何界定数组的边界索引。假设我们从左到右开始计算和，如果和大于 0 就表明前面的边界对后面是有贡献的那么就需要保留并且记录当前索引的值为左边界以及当前和的值，继续进行累加如果累加值大于最大值 max，那么就记录累加值为 max 继续比较并且当前索引值就是右边界

1. 记录一个当前连续子数组最大值 max 默认值为数组第一项，左边界索引为 0.
2. 记录一个当前连续子数组累加值 sum 默认值为数组第一项，右边界索引为 1.
3. 从数组第二个数开始，若 sum<0 则当前的 sum 不再对后面的累加有贡献，sum = 当前数
4. 若 sum>0 则 sum = sum + 当前数
5. 比较 sum 和 max ，max = 两者最大值

```ts
/**
 * 连续子数组的最大和以及最大和数组
 * @param {number[]} array
 * @returns {{max: number, maxArray: number[]}}
 */
function getTotalMaxArray(
  array: number[]
): { max: number; maxArray: number[] } {
  // 定义累加值
  let sum = array[0];
  // 定义最大值
  let max = array[0];
  // 定义临时变量用于保存左边界值
  let zeroIndex = 0;
  // 定义左边界
  let leftIndex = 0;
  // 定义右边界
  let rightIndex = array.length;
  for (let i = 1; i <= array.length - 1; i++) {
    if (sum < 0) {
      // 累加值小于0对于后续的数组其实是没有用的所以去掉
      sum = array[i];
      zeroIndex = i;
    } else {
      sum += array[i];
    }

    if (sum > max) {
      // 如果累加值大于当前的最大值的话 相当于是加了个整数的话
      max = sum;
      // 左边界指向当前临时左边界的索引
      leftIndex = zeroIndex;
      // 右边界指向当前index
      rightIndex = i + 1;
    }
  }
  const maxArray = array.slice(leftIndex, rightIndex);
  return {
    max,
    maxArray
  };
}
```

### 两数之和

#### 给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回他们的数组下标。你可以假设每种输入只会对应一个答案。但是，你不能重复利用这个数组中同样的元素。

> 好像是 leetCode 第一题，两次循环暴力穷举复杂度是 O(n2)。其实可以通过一个 map 对象来获取减法的需要值，复杂度降低到 O(n)

```ts
interface GetTwoSumMap {
  [keys: number]: number;
}

/**
 * 两数之和
 * @param {number[]} array
 * @param {number} sum
 * @returns {number[]}
 */
function getTwoSum(array: number[], sum: number): number[] {
  const map: GetTwoSumMap = {};
  for (let i = 0; i < array.length; i++) {
    const remainVal: keyof GetTwoSumMap = sum - array[i];
    if (map[remainVal] !== undefined) {
      // 如果map中有这个值了 返回两个索引即可
      return [map[remainVal], i];
    } else {
      // map中找不到 把当前值添加进map
      map[array[i]] = i;
    }
  }
  return [];
}
```

### 扑克牌顺子

#### 扑克牌中随机抽 5 张牌，判断是不是一个顺子，即这 5 张牌是不是连续的。2-10 为数字本身，A 为 1，J 为 11...大小王可以看成任何数字，可以把它当作 0 处理。

> 核心思想就是因为大小王能够用作任意数字，所以只需要计算出剩余牌的相差值小于等于大小王的数量即可视为顺子

1. 首先对牌进行排序
2. 计算出大小王的数量，就是获取 0 的数量
3. 循环获取剩余牌的间隔值，间隔值大于 0 的数量那么认为无法顺子
4. 有两张牌相等就认为不能成为顺子

```ts
/**
 * 检查牌是否顺子
 * @param {number[]} array
 * @returns {boolean}
 */
function isContinuePocker(array: number[]): boolean {
  const sortArray = array.sort((a, b) => a - b);
  let jokerNum = 0;
  let spaceNum = 0;
  for (let i = 0; i < sortArray.length - 1; i++) {
    if (array[i] === 0) {
      jokerNum += 1;
    } else {
      const space = array[i + 1] - array[i];
      if (space === 0) return false;
      spaceNum += space - 1;
    }
  }
  return jokerNum >= spaceNum;
}
```

### 三数之和

### 给定一个包含 n 个整数的数组 nums，判断 nums 中是否存在三个元素 a，b，c ，使得 a + b + c = 0 ？找出所有满足条件且不重复的三元组。

> 我们可以对数组新进行排序，然后遍历一个数 a,那么求值的操作就可以转化为上面的求和为-a 的两个数。

1. 首先对牌进行排序
2. 开始进行遍历 a，取后面的剩余数组进行遍历求和-a(这里只需要遍历后续数组的原因是因为，前面的已经计算过和了，不需要再重新进行计算)
3. 转化为两数之和，使用双指针进行计算，如果当前 a 值与上一个值相同直接跳过。

```ts
/**
 * 三数相加
 * @param {number[]} array
 * @returns {number[][]}
 */
function threeNumberSum(array: number[]): number[][] {
  const cacheArray: number[][] = [];
  const sortArray = array.sort((a, b) => a - b);
  for (let i = 0; i < sortArray.length; i++) {
    let start = i + 1;
    let end = sortArray.length - 1;
    if (i > 0 && sortArray[i] !== sortArray[i - 1]) {
      //只有在i大于0 并且不等于上一个数才进行求值
      while (start < end) {
        //大于
        if (sortArray[start] + sortArray[end] > -sortArray[i]) {
          // 右边左移
          end -= 1;
        } else if (sortArray[start] + sortArray[end] < -sortArray[i]) {
          //小于 左边右移
          start += 1;
        } else {
          // 相等 插入 然后都移动继续循环
          cacheArray.push([sortArray[i], sortArray[start], sortArray[end]]);
          end -= 1;
          start += 1;
        }
      }
    }
  }
  return cacheArray;
}
```

### 顺时针打印矩阵

#### 输入一个矩阵，按照从外向里以顺时针的顺序依次打印出每一个数字。例如，如果输入如下 4 X 4 矩阵：[[1 2 3 4],[5 6 7 8],[9 10 11 12 ], [13 14 15 16 ]]。则依次打印出数字 1,2,3,4,8,12,16,15,14,13,9,5,6,7,11,10。

> 假设起点是(start, start)，那么没走完一个圈，下一个起点就是(start +1, start +1),所以循环的结束条件是 start 都大于宽高的一半，即 start*2 > row && start* 2> column
> --------------7----------------

1. 设起点坐标为(start,start)，矩阵的行数为 rows，矩阵的列数为 columns,将打印一圈拆解为四部.
2. 第一步：从左到右打印一行
3. 第二步：从上到下打印一列
4. 第三步：从右到左打印一行
5. 第四步：从下到上打印一列
6. 注意的是最后一圈会有三种情况，首先还有圈的话那么从左向右是一定有的。
7. 如果当前 start\*2 < 列数 column 说明还可以上到下
8. 如果当前 start\*2 < 行数 row 说明还可以右到左
9. 如果当前 start\*2 + 1 < 列数 column 说明还可以下到上
   -------------8----------------------

```ts
/**
 * 顺时针顺序打印矩形数组
 * @param {number[][]} matrix
 * @returns {number[]}
 */
function getMatrixNum(matrix: number[][]): number[] {
  if (!matrix.length) return [];
  const column = matrix.length;
  const row = matrix[0].length;
  const result: number[] = [];
  //初始位置
  let start = 1;
  // 如果start *2 > column && start *2>row的时候退出循环
  while ((start - 1) * 2 < row && (start - 1) * 2 < column) {
    //首先右到左肯定是有的
    for (let i = start - 1; i <= row - start; i++) {
      result.push(matrix[start - 1][i]);
    }
    // 从上到下
    if (start * 2 <= column) {
      for (let k = start; k <= column - start; k++) {
        result.push(matrix[k][row - start]);
      }
    }
    // 从右到左
    if (start * 2 <= column && start * 2 <= row) {
      for (let i = row - start; i >= start; i--) {
        result.push(matrix[column - start][i - 1]);
      }
      // 从上到下
      if (start * 2 + 1 <= column) {
        for (let i = column - start; i > start; i--) {
          result.push(matrix[i - 1][start - 1]);
        }
      }
    }

    start += 1;
  }
  return result;
}
```

## 链表

链表存储有序的元素集合，但不同于数组，链表中的元素在内存中并不是连续放置的。每个元素由一个存储元素本身的节点和一个指向下一个元素的引用（也称指针或链接）组成。下图展 示了一个链表的结构。
相对于传统的数组，链表的一个好处在于，添加或移除元素的时候不需要移动其他元素。然而，链表需要使用指针，因此实现链表时需要额外注意。在数组中，我们可以直接访问任何位置 的任何元素，而要想访问链表中间的一个元素，则需要从起点（表头）开始迭代链表直到找到所需的元素。
------------------9-------------------------------------
在 react fiber 和 react hooks 中用到的大量的链表结构，其中 fiber node 是一条双向链表（通过 child 指向子节点，sibling 指向兄弟节点，通过 return 返回父节点）。react hooks 是单向链表，hooks 内部的 update 对象 queue 则是单向循环链表。

### 从尾到头打印链表

#### 输入一个链表，按链表值从尾到头的顺序返回一个 ArrayList

> 通过递归.next 获取下一个链表，直到.next 为 null

```ts
interface List {
  next: List | null;
  val: string;
}

/**
 * 从尾部到头部打印链表
 * @param {List} list
 * @returns {string[]}
 */
function printList(list: List) {
  const array = [];
  while (list) {
    array.unshift(list.val);
    list = list.next;
  }
  return array;
}
```

### 反转链表

#### 输入一个链表，反转链表后，输出新链表的表头。

1. 每一次循环的本质就是一直保留头部第一个链表 head（这里是 a1）,每次循环的时候把第二个之后的链表拿出来 currentNode (这里是 a2-n)拿出来,之后把头部 head（a1）链表执向 a2-n 的下一个即 a3-n 所以头部链表 head 就变成了(a1.next => a3-n)。这时候注意因为一开始 headNode 跟 head 的引用是相同的所以这时候 headNode 也是(a1.next => a3-n)。最后把 currentNode.next 执向 headNode 所以就变成了(a2.next=>a1.next => a3-n)
2. head == a1.next =>a3.next.... currentNode === headNode === a2.next => a1.next => a3.next...
3. 从上面可以看出 headNode 跟 head 之间是有引用关系的即(headNode.next === head),两者引用是相同的。所以修改 head 的引用值也会改变 headNode.next 的引用值
4. 继续循环,注意下面两句

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
  let headNode = head;
  let currentNode = null;
  while (head && head.next) {
    // 获取第二个链表
    currentNode = head.next;
    //head的下一个链表指向下下一个即第三个
    head.next = currentNode.next;
    // 第二个链表指向头部链表
    currentNode.next = headNode;

    headNode = currentNode;
  }
  return headNode;
}
```

### 反转链表中的 n-m 个节点

#### 输入一个链表，反转链表后，输出新链表的表头。例如 1-2-3-4-5,反转 2-4 个节点输出为 1-4-3-2-5。

> 其实跟上面的反转整个链表操作很相似，我们可以首先获取 n-1 的节点引用，然后从 n 开始循环反转

1. 先从头循环 n-1 的节点并且保存引用 front
2. 对于 n-m 的链表进行反转 p2
3. front.next = p2 进行引用拼接，最后返回 head 即可

```ts
function reverseBetween(head: List, n: number, m: number): List {
  //处理n =1 的情况
  if (n === 1) {
    let headNode = head;
    let currentNode;
    for (let i = 0; i < m - n; i++) {
      currentNode = head.next;
      head.next = currentNode.next;
      currentNode.next = headNode;
      headNode = currentNode;
    }
    return headNode;
  }

  let list = head;

  for (let i = 1; i < n - 1; i++) {
    list = list.next;
  }
  // 保存反转链表的前一个节点 用于.next = p2
  const front = list;
  // 需要反转的链表

  let spaceHead = list.next;
  let headNode = spaceHead;
  let currentNode;
  for (let i = 0; i < m - n; i++) {
    currentNode = spaceHead.next;
    spaceHead.next = currentNode.next;
    currentNode.next = headNode;
    headNode = currentNode;
  }
  front.next = headNode;
  return head;
}
```

### 两个一组反转链表

#### 输入一个链表，每两个一组进行反转。如:1-2-3-4-5 => 2-1-4-3-5

> 其实反转链表的操作我们已经很熟悉了,有递归以及循环的方法，递归的方法很好理解。主要是循环麻烦一点

1. 创建一个空的表头指向当前链表，主要是为了修改引用保存至
2. node.next 指向 head.next,把头结点指向第二个节点。即 node = -1-2-3-4-5-6....
3. head.next = head.next.next,这时候把 head 的第二个节点抽出。即 head = 1-3-4-5-6...
4. node.next.next = head,这时候设置第二个节点。即 node = -1-2-(1-3-4-5-6...)
5. 上面步骤继续循环:node = node.next.next; node = 1-3-4-5-6...
6. head = head.next; head = 3-4-5-6-7...
   -------------------10--------------

```ts
/**
 * 两个一组反转链表
 * @param head
 */
function swapPairs(head: List): List {
  if (!head) return null;
  if (!head.next) return head;
  const first = head;
  const second = head.next;
  first.next = swapPairs(second.next);
  second.next = first;
  return second;
}

// 循环方法
function swapPairs2(head: List): List {
  let node = new ListNode(-1);
  node.next = head;

  let point = node;

  while (head && head.next) {
    // 把第二个头放到第一位去 这时候node就是-1-2
    node.next = head.next;
    // 这时候head是 1,2,3 需要打碎成 1,3方便后续
    head.next = head.next.next;
    // 拼接 -1-2-1-3
    node.next.next = head;

    // 修改指针指向 继续进行循环

    // 指向1-3-4-5
    node = node.next.next;
    // 指向3-4-5
    head = head.next;
  }
  return point.next;
}
```

### 判断回文链表

#### 判断某个链表是否回文链表： 1-2-3-4-4-3-2-1 是回文链表

> 对于数组来说，回文链表很简单，通过首尾双指针向中间逼近就可以了。对于链表来说，核心在于如何获取中间指针，然后起始指针和中间指针循环判断即可。

1. 我们设置两个指针，一个走一步 p1，一个走两步 p2，当 p2 指针走完链表有两种情况。
2. 当链表是偶数长度时，那么 p2 是可以直接走到终点的。这时候链表走的慢的 p1 就处在链表中点上，p1 再走上一步就是回文链表的后半部分了
   ------------------------11----------------
3. 当链表是基数长度时，这时候 p2 在终点时再走两步那么久走出链表了(p2 ===null)，这时候慢指针就处于链表中点上再走一步就是回文链表的后半部分。
   -----------------12----------------
4. 拿到了回文链表的后半部分，这时候我们对后半部分进行反转，然后循环比较即可判断是否回文联表了

### 链表倒数第 k 个节点

#### 输入一个链表，输出该链表中倒数第 k 个结点。

> 如果先循环出链表的所有长度在进行求值的话，需要循环两次复杂度为 2n。可以使用双指针进行优化

1. 初始指针 a,第二个指针 b 与指针 a 间隔为 k
2. 这时候两个指针都进行循环，如果 b 指针到达终点了，那么 a 指针当前位置就是倒数第 k 个节点位置

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

#### 给一个链表，若其中包含环，请找出该链表的环的入口结点，否则，输出 null。

> 问题可以拆分成两部分 1 如果判断链表是否有环，第二个如何查找环的起点。

1. 如何判断链表是否有环：我们只需要两个指针，一个走一步，一个走两步，只要指针有相遇的话那么就是有环。（假设链表没有环的话，那么因为快指针走的越来越远那么两个指针永远不可能相遇。如果链表有环，假设快慢指针都在环里面，如果以慢指针作为参考物，那么快指针每次走一步，如果有环的话，那么两个指针最终一定会相遇）
2. 如何判断环的起点。首先我们假设有两个指针都在环的起点，如果让某一个指针先走环的长度 K，那么该指针还是会回到环的起点与另一个指针相遇。这时候快的指针相对于慢的指针其实是先走了 K 步，这时候快的指针相对于慢的指针先走了环的长度 k 步。我们再把两个指针平移同样的步数直到慢的起点。所以最终判断环的起点问题可以转化为：两个指针 a,b。a 在起点，b 先走环的长度，如果 a 和 b 相遇了那么当前位置就是环的起点入口。
3. 环的长度可以通过在环内的一点每次走一步又走到当前点的话，那么走的步数就是环的长度。

```ts
function getListStart(list: List): List | null {
  // 首先判断链表是否有环
  // 慢的先走1步
  let slow = list.next;
  // 快的先走两步
  let fast = list.next.next;

  // 初始化环的长度
  let squareLength = 0;
  while (fast !== slow) {
    if (fast && fast.next) {
      fast = fast.next.next;
      slow = slow.next;
    } else {
      // 快指针已经到终点了还没遇到那么久没有环
      return null;
    }
  }

  // 有环 这里需要拿环的长度 此时 fast和slow必定在环内
  slow = slow.next;
  squareLength += 1;
  while (slow !== fast) {
    slow = slow.next;
    squareLength += 1;
  }
  // 都回到原点
  slow = list;
  fast = list;
  // 快指针先走环的长度步数
  for (let i = 1; i <= squareLength; i++) {
    fast = fast.next;
  }
  //获取环的起点
  while (slow !== fast) {
    slow = slow.next;
    fast = fast.next;
  }
  return slow;
}
```

### 两个链表的第一个公共节点

#### 输入两个链表，找出它们的第一个公共结点。

> 假设两个公共链表有公共节点，那么从这节点开始后续的元素位置相同并且长度必须相等合并成一条线，所以我们两条链表的尾部对齐，长一点的链表 pass 掉差异的长度，然后依次比较是否相等即可。

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

#### 0,1,...,n-1 这 n 个数字排成一个圆圈，从数字 0 开始，每次从这个圆圈里删除第 m 个数字。求出这个圆圈里剩下的最后一个数字。

> 约瑟夫环总共有三种做法：1 通过链表循环删除对应的节点，2 通过数组取值使用索引，3 通过递归。

1. 使用链表，我们只需要把元素组装成一个链表，然后通过循环没过 m 个节点删除元素即可，直到只剩下一个元素
2. 通过描述我们可以得出一条规律：从当前某个元素开始数，下一个被删除的数字等于 m 除以总人数的余数，假设第 1 次删除的数字是：第一个数字 0 开始数起的第 m 个数。举个例子：假设 m 是 2，总人数是 10,那么第(2 % 10) = 2 第二个数字要被删除。对应索引的话就得到删除的索引 Index = ((m)% n) -1。我们可以通过数组去循环即可。
3. d 动态规划:
4. 第一轮的时候第一个被删除索引是(m-1)%n。所以第二轮的开始（0）位置索引就是 m%n,所以推导出第二轮第 k 个位置在第 1 轮的索引就是(m+k)%n。
5. 假设在第 n 轮时候的某个人位置是 f(n)，那么第 n-1 轮的时候位置其实就是 f(n-1) = (m+f(n))%n。即第 7 轮某个人位置是 2 那么第 6 轮他的位置就是(m+ 2)%n, 那么第五轮他的位置就是(m + ((m+ 2)%n))%n。
6. 现在我们知道 8 个人时，最后一轮就是第七轮因为每一轮走一个人此时剩下的人索引就是 0，所以上一轮他的位置就是(m+2)%8,因此我们可以一直循环上去直到第一轮就是他获取的位置。

```ts
//链表解决
function getRemainPeopleIndexByList(total: number, space: number): number {
  interface List {
    next?: List;
    val: number;
  }
  const head: List = { val: 0 };
  let current: List = head;
  for (let i = 1; i < total; i++) {
    current.next = { val: i };
    current = current.next;
  }
  current.next = head;
  while (current.next != current) {
    for (let i = 0; i < m - 1; i++) {
      current = current.next;
    }
    current.next = current.next.next;
  }
  return current.val;
}

// 数组
function getRemainPeopleIndexByArray(total: number, space: number): number {
  if (total < 1 || space < 1) {
    return -1;
  }
  const array = [];
  let index = 0;
  for (let i = 0; i < total; i++) {
    array[i] = i;
  }
  while (array.length > 1) {
    index = ((index + space) % array.length) - 1;
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
  let totalLunshu = total - 1;
  // 最后第totalLunshu轮时胜利人的索引是0
  let lastPeopleIndex = 0;
  // 1. 第一轮的时候第一个被删除索引是(m-1)%n。所以第二轮的开始（0）位置索引就是m%n,所以推导出第二轮第k个位置在第1轮的索引就是(m+k)%n。
  // 2. 假设在第n轮时候的某个人位置是f(n)，那么第n-1轮的时候位置其实就是f(n-1) = (m+f(n))%(total - n)。即第7轮某个人位置是2 那么第6轮他的位置就是(m+ 2)%(total - 6), 那么第五轮他的位置就是(m + ((m+ 2)%n))%n。
  // 3. 现在我们知道8个人时，最后一轮就是第七轮因为每一轮走一个人此时剩下的人索引就是0，所以上一轮他的位置就是(m+2)%8,因此我们可以一直循环上去直到第一轮就是他获取的位置。

  // 一直循环到00位置 走totalLunshu轮
  while (totalLunshu > 0) {
    //上一轮的索引 f(n-1) = f(n-1) = (m+f(n))%（每一轮的人数）
    lastPeopleIndex = (space + lastPeopleIndex) % (total - totalLunshu + 1);
    totalLunshu -= 1;
  }
  return lastPeopleIndex;
}
```

### 合并两个排序的链表

#### 输入两个单调递增的链表，输出两个链表合成后的链表，当然我们需要合成后的链表满足单调不减规则。

> 核心在于比较两个表头，把比较小的值塞进一个链表中，然后大的值继续与小的值的链表继续比较

1. 假设有 p1 和 p2 两个链表, 比较 p1 和 p2 的值。
2. 如果 p1 小于 p2，那么把 p1 的值保存起来，然后 p1 的下一个值继续与 p2 进行比较
3. 如果 p1 大于 p2，那么把 p2 的值保存起来，然后 p2 的下一个值继续与 p1 进行比较

```ts
/**
 * 合并两个单调递增的链表
 * @param first
 * @param second
 */
function sortTwoList(p1: List, p2: List): List {
  if (!p1) return p2;
  if (!p2) return p1;
  let head;
  if (p1.val < p2.val) {
    head = p1;
    head.next = sortTwoList(p1.next, p2);
  } else if (p1.val > p2.val) {
    head = p2;
    head.next = sortTwoList(p1, p2.next);
  } else {
    head = p1;
    head.next = sortTwoList(p1.next, p2.next);
  }
  return head;
}
```

## 二叉树

### 树

树结构包含一系列存在父子关系的节点。每个节点都有一个父节点（除了顶部的第一个 节点）以及零个或多个子节点,在前端中最常见的树形结构就是 html 的 dom 节点，从 html 节点开始到最深层次的 div 节点就是一个典型的树形结构。

### 二叉树

二叉树中的节点最多只能有两个子节点：一个是左侧子节点，另一个是右侧子节点。这个定义有助于我们写出更高效地在树中插入、查找和删除节点的算法。

和链表一样，我们将通过指针（引用）来表示节点之间的关系（树相关的术语称其为边）。 在双向链表中，每个节点包含两个指针，一个指向下一个节点，另一个指向上一个节点。对于树， 使用同样的方式（也使用两个指针），但是一个指向左侧子节点，另一个指向右侧子节点。因此， 将声明一个 Node 类来表示树中的每个节点。值得注意的一个小细节是，不同于在之前的章节中 将节点本身称作节点或项，我们将会称其为键。键是树相关的术语中对节点的称呼。
----------13--------------------

### 二叉树的基本操作

### 二叉树的遍历（中序遍历，先序遍历，后序遍历）

1. 中序遍历是一种以上行顺序访问二叉树所有节点的遍历方式，也就是以从最小到最大的顺序访问所有节点,中序遍历的一种应用就是对树进行排序操作。可以理解为，左=>自身=>右。分为递归和循环两个版本
  2. 递归的版本很好理解，主要是循环的方式
  3. 循环的话，创建一个栈。循环左键进栈，直到为空。
  4. 这时候取出栈的最后一个节点（最开始其实就是最小的键），保存值。
  5. 这时候以右键作为目标节点，继续上述的步奏（这时候.right 为空， 会跳过左节点入栈的 2 步奏，取出来的下一个就是最小键的父键）

```ts
//中序遍历
// 递归
function inorderTraversal(root: TreeNode): number[] {
  let arr: number[] = [];
  function traversersal(node: TreeNode) {
    if (node) {
      // 先打印node.left
      traversersal(node.left);
      // 在打印当前node
      arr.push(node.val);
      // 最后打印node.right
      traversersal(node.right);
    }
  }
  traversersal(root);
  return arr;
}
// 循环解法
function inorderTraversal2(node: TreeNode): number[] {
  const result = [];
  const stack = [];
  let current = node;
  while (current && stack.length) {
    while (current) {
      // 左键入栈
      stack.push(current);
      current = current.left;
    }
    // 取出最后一个保存值
    current = stack.pop();
    result.push(current.val);
    //取右键继续循环
    current = current.right;
  }
  return result;
}
```

2. 先序遍历是以优先于后代节点的顺序访问每个节点的。先序遍历的一种应用是打印一个结构化的文档，可以理解为自身=>左=>右，也分为递归和循环版本。
   1. 递归的版本很好理解，主要是循环的方式.
   2. 先序的循环解法跟中序基本一样，区别在于，循环左键进栈的时候就需要把当前节点值保存起来了
      ------------------14--------------------------

```ts
// 先序遍历
function preorderTraversal(root: TreeNode): number[] {
  let arr: number[] = [];
  function traversersal(node: TreeNode) {
    if (node) {
      // 先保存自身的值
      arr.push(node.val);
      // 在报错left
      traversersal(node.left);
      // 最后保存node.right
      traversersal(node.right);
    }
  }
  traversersal(root);
  return arr;
}
//循环
function preorderTraversal2(root: TreeNode): number[] {
  const result: number[] = [];
  const stack: TreeNode[] = [];
  let current = root;
  while (current || stack.length) {
    while (current) {
      stack.push(current);
      result.push(current.val);
      current = current.left;
    }
    current = stack.pop();
    current = current.right;
  }
  return result;
}
```

3. 后序遍历则是先访问节点的后代节点，再访问节点本身。后序遍历的一种应用是计算一个目录及其子目录中所有文件所占空间的大小。可以理解为左=>右=>自身.
  1. 递归的版本很好理解，主要是循环的方式.
  2. 先序的循环解法跟中序有点类似，区别在于访问完左键了这时候要先访问右键才能出栈。父键的出栈时机是 k.right 已经被访问了，这样子我们可以存储一个变量用于保存被访问的键

```ts
// 后续遍历
function lastorderTraversal(root: TreeNode): number[] {
  let arr: number[] = [];
  function traversersal(node: TreeNode) {
    if (node) {
      traversersal(node.left);
      traversersal(node.right);
      arr.push(node.val);
    }
  }
  traversersal(root);
  return arr;
}

//循环
function lastorderTraversal2(root: TreeNode): number[] {
  const result: number[] = [];
  const stack: TreeNode[] = [];
  // 保留一个变量作为最后的访问点
  let last = null;
  let current = root;
  while (current || stack.length) {
    while (current) {
      stack.push(current);
      // 可以出栈
      current = current.left;
    }
    // 获取当前最末尾的栈
    current = stack[stack.length - 1];
    if (!current.right || current.right === last) {
      // 没有子健 或者 子健的right已经访问过了 那么可以出栈保存值
      current = stack.pop();
      result.push(current.val);
      // 最后访问点更新
      last = current;
      current = null;
    } else {
      // 右键还没访问 不允许出栈 先访问右边的键
      current = current.right;
    }
  }
  return result;
}
```
------------15-------------------

### 二叉树的最大深度以及最小深度
>最大深度很好理解，递归就可以了，但是最小深度的话有可能出现左键右键为空的情况，就不用进行比较了
```ts
// 获取最大深度
function getMaxDepth(node: TreeNode):number {
	if(!node) return 0
	return Math.max(getMaxDepth(node.left), getMaxDepth(node.right) + 1)
}

// 获取最小深度
function getMinDepth(node: TreeNode): number {
	if(!node) return 0
	// 只有双键存在才能比较
	if(node.left && node.right){
		return Math.min(getMaxDepth(node.left), getMaxDepth(node.right) + 1) 
	}else if(node.left){
		// 右键为空 那么不用比较右键了
		return 1 + getMinDepth(node.left)
	}else if(node.right){
		// 左键为空 那么不用比较左键了
		return 1 + getMinDepth(node.right)
	}else {
		// 当前节点就是叶子节点
		return 1
	}
}
```

### 判断是否对称二叉树
> 对称二叉树指的是两颗二叉树根结点相同，但他们的左右两个子节点交换了位置。
1. 核心就是递归判断两个键(node1, node2)是否相等，如果有一个为null或者值不相等那么就不是.
2. 这时候需要判断(node1, node2)的子健是否相等，比对条件是**node1.left 比对node2.right  node1.right比对node2.left**
3. 2的方法继续进行继续递归

```ts
// 判断是否对称二叉树
function isSymmetrical(node: TreeNode): boolean {
	if(!node) return true
	function checkIsSymmetrical(node1: TreeNode |null, node2: TreeNode |null): boolean{
		if(!node1 && !node2){
			// 都为空
			return true
		}
		if(!node1 || !node2){
			// 一个为空
			return false
		}
		if(node1.val !== node2.val){
			return false
		}
		// 比对子健 这时候是 node1.left 比对node2.right  node1.right比对node2.left
		return checkIsSymmetrical(node1.left, node2.right) && checkIsSymmetrical(node1.right, node2.left)
	}

	return checkIsSymmetrical(node.left, node.right)
}
```

### 二叉树的镜像
#### 操作给定的二叉树，将其变换为源二叉树的镜像。
> 其实很上面的判断是否对称二叉树差不多，就是从上到下替换两个键的引用
```js
       源二叉树 
    	    8
    	   /  \
    	  6   10
    	 / \  / \
    	5  7 9 11
    	镜像二叉树
    	    8
    	   /  \
    	  10   6
    	 / \  / \
    	11 9 7  5
```
#### 解答
```ts
function mirrorNode(root: TreeNode): TreeNode {
	if(root){
		const temp = root.left
		root.left = root.right
		root.right = temp
		// 递归
		mirrorNode(root.left)
		mirrorNode(root.right)
	} 
	return root
}
```

### 二叉树的第k小的节点
>给定一棵二叉搜索树，请找出其中的第k小的结点。 例如， （5，3，7，2，4，6，8） 中，按结点数值大小顺序第三小结点的值为4。
1. 从上面得出的是，中序遍历得出的是从小到达的值，然后加上索引即可求出

```ts
```

### 获取二叉树所有的路径
>其实跟之前做的获取dom节点的所有树形结构相类似，通过第二个参数进行维护父级的树形结构，不需要额外的一个数组来保存栈结构
```ts
var binaryTreePaths = function(root) {
    const result = []
    function getTreePaths(node, parentPath){
        if(!node) return 
        const currentPath = parentPath ? `${parentPath}->${node.val}` : String(node.val)
        if(!node.left && !node.right){
            result.push(currentPath)
        }
        getTreePaths(node.left, currentPath)
        getTreePaths(node.right, currentPath)
    }
    getTreePaths(root)
    return result
};
```

### 二叉树中和为某一值的路径
#### 输入一颗二叉树的跟节点和一个整数，打印出二叉树中结点值的和为输入整数的所有路径。路径定义为从树的根结点开始往下一直到叶结点所经过的结点形成一条路径。
> 跟上面的获取所有路径有点相似，理论上也可以通过传入第二个参数的形式保存调用栈，但是这次我们通过保存调用栈的形式来做
1. 数组result来存储所有符合条件的路径，栈stack来存储当前路径中的节点，sum来标识当前路径之和。
2. 记住的是stack的站路径和sum必须在每次执行完之后回溯

```ts
// 获取值为sum的二叉树路径
function findPath(root: TreeNode, sum:number):number[][] {
	const result: number[][] = []
	let toal = 0
	const stack: number[] = []

	function getPath(node: TreeNode) {
		if(!node) return 
		toal += node.val
		stack.push(node.val)
		if(!node.left && !node.right){
			// 叶子节点了
			if(sum === toal){
				result.push(stack.slice())
			}
		}

		getPath(node.left)
		getPath(node.right)
		// 执行完成出栈以及减值
		stack.pop()
		toal -=node.val
	}
	getPath(root)
	return result
}
```
## 堆和栈

堆和栈的数据结构一般都是成双成对，这里就一并讲了吧。

1. 堆的结构类似于图书馆的藏书架子一样，书本整齐的放在书架上，你只需要知道相对应的书架行号和列号，那么就可以直接拿到这本书，类似于对象的数据格式一样 。js 中的引用变量都以堆的形式放在内存中。
2. 首先 js 中 JavaScript 的执行上下文沿用了栈结构，即我们经常说的执行上下文栈，栈是一个什么样的数据结构呢。简单说就是：先进后出，后进后出。就像高中时化学实验的量筒，假设往量筒中放入乒乓球的模型一样。一号球是最开始放进去的，五号球球是最后放入的。但是如果要把所有球拿出来，那么就是 5 号球先拿出来，一号球最后，栈就是这种结构。
   -----------1----------
