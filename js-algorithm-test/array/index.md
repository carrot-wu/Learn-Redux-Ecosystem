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

###  无重复字符的最长子串
#### 给定一个字符串，请你找出其中不含有重复字符的 最长子串 的长度。 abcabcbb的无重复字符的最长子串是 "abc"，所以返回3
>滑动窗口的一道题
1. 创建一个数组来作为滑动窗口，声明一个最大值的变量，从0开始循环
2. 如果当前元素在数组内存在了，那么把当前元素与之前的头删除，最后在插入当前值在末尾
3. 比较max与当前数组的长度获取较大值

```ts
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
   if(!s) return 0
    let max = 0
    let slide = []
    for(let i =0;i < s.length; i++){
      const val = s[i]
      // 判断是否已在slide里了
      const index = slide.indexOf(val)
      if(index > -1){
        // 把头去掉继续循环
        slide.splice(0, index+1)
      }
      // 插入当前值
      slide.push(val)
      max = Math.max(max, slide.length)

    }
    return max
};
```

### 承最多水的容器
#### 给你 n 个非负整数 a1，a2，...，an，每个数代表坐标中的一个点 (i, ai) 。在坐标内画 n 条垂直线，垂直线 i 的两个端点分别为 (i, ai) 和 (i, 0)。找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。
-------------a1-------------
>解决的本质是通过双指针进行向中间求值判断的过程，核心在于双指针是否要移动
1. 因为矩形的面积= 最短的边 * (两条边的间距)
2. 要矩阵面积最大化，两条垂直线的距离越远越好，两条垂直线的最短长度也要越长越好。
3. 创建两个指针在首尾，这时候为了查找是否还有容积大的，所以短的边要移动一格，比较大小
3. 123继续循环

```ts
// 获取最大水的容积
var maxArea = function(height: number[]):number {
	let start = 0
	let end = height.length -1
	let max = Math.min(height[start], height[end]) *(end -start)

	while(start < end) {
		// 判断哪个最小
		if(height[start] > height[end]){
			end -=1
		}else {
			start +=1
		}
		max = Math.max(Math.min(height[start], height[end]) *(end -start), max)
	}
	return max
};

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

### 在排序数组中查找元素的第一个和最后一个位置
#### 给定一个按照升序排列的整数数组 nums，和一个目标值 target。找出给定目标值在数组中的开始位置和结束位置。
>对于一些排序了的数组问题，都可以通过二分查找来优化问题，二分查找的本质就是，把数组分成两部分，根据值的大小取某一部分继续二分，直到数组长度小于2
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
  const sortArray = nums.sort((a,b) => a-b)
  const result: number[][] = []
  let start
  let end
  for(let i =0; i< sortArray.length; i++){
    if(sortArray[i] !== sortArray[i-1] || i === 0){
      start = i + 1
      end = sortArray.length - 1
      while(start < end){
        if(sortArray[start] + sortArray[end] > -sortArray[i]){
          // 大于  右边的指针左移
          end -=1
        }else if(sortArray[start] + sortArray[end] < -sortArray[i]){
          // 小于  左指针右移
          start +=1
        }else {
          // 相等
          result.push([sortArray[i], sortArray[start], sortArray[end]])
          //指针都移动 继续查询
          start +=1
          end -=1

          // 为了防止 如果下一个指针等于当前上一个指针也跳过
          while(sortArray[start] === sortArray[start-1]){
            start +=1
          }
          while(sortArray[end] === sortArray[end+1]){
            end -=1
          }
          
        }
      }
    }
  }
  return result
}
```

### 顺时针打印矩阵

#### 输入一个矩阵，按照从外向里以顺时针的顺序依次打印出每一个数字。例如，如果输入如下 4 X 4 矩阵：[[1 2 3 4],[5 6 7 8],[9 10 11 12 ], [13 14 15 16 ]]。则依次打印出数字 1,2,3,4,8,12,16,15,14,13,9,5,6,7,11,10。

> 假设起点是(start, start)，那么没走完一个圈，下一个起点就是(start +1, start +1),所以循环的结束条件是 start 都大于宽高的一半，即 start*2 > row && start* 2> column

![alt](http://img.carrotwu.com/FmkXmJNMqu-kOTMR-FhrwMIXN_PS)

1. 设起点坐标为(start,start)，矩阵的行数为 rows，矩阵的列数为 columns,将打印一圈拆解为四部.
2. 第一步：从左到右打印一行
3. 第二步：从上到下打印一列
4. 第三步：从右到左打印一行
5. 第四步：从下到上打印一列
6. 注意的是最后一圈会有三种情况，首先还有圈的话那么从左向右是一定有的。
7. 如果当前 start\*2 < 列数 column 说明还可以上到下
8. 如果当前 start\*2 < 行数 row 说明还可以右到左
9. 如果当前 start\*2 + 1 < 列数 column 说明还可以下到上  
   ![alt](http://img.carrotwu.com/FsHdS2avBVQq6WmCk1i9rAvfLshi)

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
