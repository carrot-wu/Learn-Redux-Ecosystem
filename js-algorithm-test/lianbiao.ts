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

/**
 * 连续子数组的最大和以及最大和数组
 * @param {number[]} array
 * @returns {{max: number, maxArray: number[]}}
 */
function getTotalMaxArray(array: number[]):{max: number, maxArray: number[]} {
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
  for (let i = 1; i <= (array.length -1); i++) {
    if(sum < 0){
      // 累加值小于0对于后续的数组其实是没有用的所以去掉
      sum = array[i]
      zeroIndex = i
    }else {
      sum += array[i]
    }

    if(sum > max){
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

interface GetTwoSumMap {
  [keys : number]: number
}

/**
 * 两数之和
 * @param {number[]} array
 * @param {number} sum
 * @returns {number[]}
 */
function getTwoSum(array: number[], sum:number): number[] {
  const map:GetTwoSumMap = {}
  for (let i =0; i<array.length; i++) {
    const remainVal: keyof GetTwoSumMap = sum -array[i]
    if(map[remainVal] !== undefined){
      // 如果map中有这个值了 返回两个索引即可
      return [map[remainVal], i]
    }else {
      // map中找不到 把当前值添加进map
      map[array[i]] = i
    }
  }
  return []
}

/**
 * 检查牌是否顺子
 * @param {number[]} array
 * @returns {boolean}
 */
function isContinuePocker(array: number[]):boolean {
  const sortArray = array.sort((a,b) => a-b)
  let jokerNum = 0
  let spaceNum = 0
  for (let i =0; i<sortArray.length -1; i++){
    if(array[i] === 0){
      jokerNum +=1
    }else{
      if(array[i] !==0){
        const space = array[i+1] - array[i]
        if(space === 0) return false
        spaceNum += space -1
      }
    }
  }
  return jokerNum >= spaceNum
}
