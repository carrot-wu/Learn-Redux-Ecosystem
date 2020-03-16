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

/*---------------链表--------------*/
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

/**
 * 获取倒数第n个节点的链表
 * @param {List} list
 * @param {number} k
 * @returns {string | null}
 */
function getLastListVal(list: List, k: number): string | null {
  if (Number(k) > 0) {
    let slow = list;
    let fast = list;
    let index = 1;
    while (fast && fast.next) {
      fast = fast.next;
      if (index >= k) {
        slow = slow.next;
      }
      index++;
    }
    return index < k ? null : slow.val;
  } else {
    return null;
  }
}

function getListStart(list: List): List | null {
  // 首先判断链表是否有环
  // 慢的先走1步
  let slow = list.next;
  // 快的先走两步
  let fast = list.next.next;

  // 环的长度
  let squareLength = 0;
  while (fast !== slow) {
    if (fast && fast.next) {
      // 快指针已经到终点了还没遇到那么久没有环
      fast = fast.next.next;
      slow = slow.next;
    } else {
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

function getRemainPeopleIndex(total: number, space: number) {
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
