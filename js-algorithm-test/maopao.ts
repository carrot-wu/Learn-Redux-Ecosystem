//冒泡
/**
 *
 * @param array 传入的排序数组
 */
//冒泡排序的原理就是循环两次 依次比较左右大小进行替换
function ma (array: number[]): number[] {
  if (!Array.isArray(array)) throw new Error('参数必须为数组')
  const defaultArray = array.slice()
  for (let i = 0; i < array.length - 1; i++) {
    for (let v = 0; v < array.length - 1; v++) {
      if (defaultArray[v] > defaultArray[v + 1]) {
        [defaultArray[v], defaultArray[v + 1]] = [defaultArray[v + 1], defaultArray[v]]
      }
    }
  }
  return defaultArray
}

const maArray = [1, 2, 3, 1111, 12, 32, 11, 411, 21, 67, 987, 45, 1, 2, 56, 43, 65]
//ma(maArray)

//选择排序 理论就是每一次循环中获取当前循环的值  循环全部数组获取最小的值然后又进行替换
function xuan (array: number[]): number[] {
  if (!Array.isArray(array)) throw new Error('参数必须为数组')
  const defaultArray = array.slice()
  for (let i = 0; i < defaultArray.length - 1; i++) {
    let index = i
    for (let j = i + 1; j < defaultArray.length - 1; j++) {
      if (defaultArray[index] > defaultArray[j]) index = j
    }
    [defaultArray[i], defaultArray[index]] = [defaultArray[index], defaultArray[i]]
  }
  return defaultArray
}

insert(maArray)

//插入排序 将第一个元素视为有序序列，遍历数组，将之后的元素依次插入这个构建的有序序列中。
function insert (array: number[]): number[]{
  if (!Array.isArray(array)) throw new Error('参数必须为数组')
  let i
  let j
  for (i = 1; i < array.length; i++) {
    let ele = array[i]
    for (j = i - 1; j >= 0; j--) {
      let temp = array[j]
      if (ele < temp) {
        array[j + 1] = temp
      } else {
        break
      }
    }
    array[j + 1] = ele
  }
  return array
}

//动态规划
/*
* 先举一个很通俗易懂的例子，也是图解算法中的例子，有一个只能装4kg的包，物品有音响3000元-重4kg，吉他1500元-重1kg，电脑2000元-重3kg。问，要想包里的价值最高，应该怎么装？（注意：不考虑 物品的体积，不要想吉他很大放不下。）*/
// 第一个函数求出具体的物品
//https://juejin.im/post/5c623ff3f265da2de1657f97
const weight = [2, 3, 5, 2, 3, 6, 5, 5]
const values = [3, 5, 2, 5, 4, 7, 8, 3]
const maxWeight = 10
/*
function getProductMaxValue (weight, values, maxWeight) {
  const defaultValueArray = Array.from({ length: weight.length }).fill(1).map(() => ([]))
  //获取第一件物品在 0 - maxWeight的价值
  for (let currentWeight = 0; currentWeight <= maxWeight; currentWeight++) {
    //第一件物品的价值‘’
    const firstValue = values[0]
    // 当前物品的质量是否大于背包中粮

    //itemIndexArray 用来保存物品的索引
    if (weight[0] > currentWeight) {
      // 大于 那么价值就为0
      defaultValueArray[0][currentWeight] = { value: 0, itemIndexArray: [] }
    } else {
      // 不然 价值就是当前物品的价值
      defaultValueArray[0][currentWeight] = { value: firstValue, itemIndexArray: [0] }
    }
  }
  // 接下来循环之后的产品
  for (let currentWeight = 0; currentWeight <= maxWeight; currentWeight++) {

    //获取第二件以及以后的产品价值
    for (let currentItemIndex = 1; currentItemIndex <= weight.length - 1; currentItemIndex++) {
      // 获取当前产品价值
      const currentItemValue = values[currentItemIndex]
      // 获取当前产品重量
      const currentItemWeight = weight[currentItemIndex]
      const remainWeight = currentWeight - currentItemWeight
      // 接下来有两种情况 如果能够放进去当前物品的话
      // 剩余背包的重量 remainWeight = maxWeight - currentWeight
      // 那入背包的最高价值就是 当前背包价值 加上剩余重量的最高价值（就是上一个数组的重量价值defaultArray[currentItemIndex-1]）
      // (currentValue + defaultArray[currentItemIndex-1][remainWeight])
      // 那么比较加入跟不加入之前的价值 取最大即可

      // 不加当前物品质量最大价值（上一个数组就是最大值）
      const { value: noCurrentItemMaxValue, itemIndexArray: lastItemIndexArray } = defaultValueArray[currentItemIndex - 1][currentWeight]
      if (remainWeight >= 0) {
        //放入当前物品
        //  加入当前物品最大价值
        const { value: remainWeightValue, itemIndexArray: remainWeightIndexArray } = defaultValueArray[currentItemIndex - 1][remainWeight]
        const addItemMaxValue = currentItemValue + remainWeightValue
        // 取最大值
        defaultValueArray[currentItemIndex][currentWeight] = {
          value: Math.max(noCurrentItemMaxValue, addItemMaxValue),
          itemIndexArray: (addItemMaxValue - noCurrentItemMaxValue) > 0 ? [...remainWeightIndexArray, currentItemIndex] : [...lastItemIndexArray]
        }
      } else {
        // 放不进去的话 那么那之前的最大值
        defaultValueArray[currentItemIndex][currentWeight] = {
          value: noCurrentItemMaxValue,
          itemIndexArray: [...lastItemIndexArray]
        }
      }
    }
  }
  return defaultValueArray
}
*/

/**
 *
 * @param weight 物品重量数组
 * @param values 物品价值数组
 * @param maxWeight 背包最大重量
 */
function getProductMaxValue(weight: number[],values: number[],maxWeight: number):Array<Array<number>> {
  const defaultArray:Array<Array<number>> = Array.from({length: weight.length}).fill(1).map(() => ([]))
  //获取第一件物品在 0 - maxWeight的价值
  for(let currentWeight = 1; currentWeight<= maxWeight; currentWeight ++){
    //第一件物品的价值‘’
    const firstValue =  values[0]
    // 当前物品的质量是否大于背包中粮
    if(weight[0] > currentWeight){
      // 大于 那么价值就为0
      defaultArray[0][currentWeight] = 0
    }else{
      // 不然 价值就是当前物品的价值
      defaultArray[0][currentWeight] = firstValue
    }
  }
  // 接下来循环之后的产品
  for(let currentWeight = 1; currentWeight<= maxWeight; currentWeight ++){

    //获取第二件以及以后的产品价值
    for(let currentItemIndex = 1; currentItemIndex <= weight.length-1; currentItemIndex++){
      // 获取当前产品价值
      const currentItemValue = values[currentItemIndex]
      // 获取当前产品重量
      const currentItemWeight = weight[currentItemIndex]
      const remainWeight = currentWeight - currentItemWeight
      // 接下来有两种情况 如果能够放进去当前物品的话
      // 剩余背包的重量 remainWeight = maxWeight - currentWeight
      // 那入背包的最高价值就是 当前背包价值 加上剩余重量的最高价值（就是上一个数组的重量价值defaultArray[currentItemIndex-1]）
      // (currentValue + defaultArray[currentItemIndex-1][remainWeight])
      // 那么比较加入跟不加入之前的价值 取最大即可

      // 不加当前物品质量最大价值（上一个数组就是最大值）
      const noCurrentItemMaxValue = defaultArray[currentItemIndex-1][currentWeight]
      if(remainWeight >= 0 ){
        //  加入当前物品最大价值
        const addItemMaxValue = currentItemValue + defaultArray[currentItemIndex-1][remainWeight]
        // 取最大值
        defaultArray[currentItemIndex][currentWeight] = Math.max(noCurrentItemMaxValue, addItemMaxValue)
      }else{
        // 放不进去的话 那么那之前的最大值
        defaultArray[currentItemIndex][currentWeight] = noCurrentItemMaxValue
      }
    }
  }
  return defaultArray
}
getProductMaxValue(weight, values, maxWeight)

/*
*  剪枝叶
*
* 有一条马路，马路上有很多树，树的高度不一。现在要统一剪树，剪到高度为 h。 意思就是，比 h 高的树都剪到 h，比 h 低的树高度不变。所有的树剪掉的总长度为 C。 现在要使 C>某个值的情况下(假设为 MM)，使 h 最大。问怎么确定 h。
* */

// 循环 从0 开始循环到列表树的最大长度
function cutTreeLeaf(list: number[],cutTotalMin: number):number {
  let start = 0
  let end: number =  Math.max.apply(null, list)

  while(end >= start){
    //
    let cutTotal = 0
    for(let i = 0; i < list.length; i++){
      cutTotal += list[i] > end ? list[i] - end : 0
    }
    if(cutTotal >= cutTotalMin){
      break
    }else{
      end--
    }
  }
  return end
}

function getStairsMethods(n:number):number {
  //用于缓存 f(1)f(2)f(3)f(4)的数组 先保存f(1)f(2)的值
  const cacheStairs = Array.from(new Array(n)).fill(0)
  cacheStairs[0] =1
  cacheStairs[1] =2
  // 循环开始
  for(let i = 3; i<=n; i++){
    const index = i - 1
    // 开始计算
    cacheStairs[index] = cacheStairs[index - 1] + cacheStairs[index -2]
  }
  return cacheStairs[n-1]
}

const uniquePathsWithObstacles = function(obstacleGrid: number[][]):number {
  //先获取m,n的大小
  const m = obstacleGrid.length
  const n = obstacleGrid[0].length

  // 制造一个二维数组
  const cacheArray: number[][] = Array.from({length: m}).fill(1).map(() => ([]))
  // 其中(1,1)的值为0 (2,1)的值为1 (1,2)的值为

  //如果m,n都为1 或者起点终点坐标有障碍物直接返回0
  if(obstacleGrid[m-1][n-1] ===1 || obstacleGrid[0][0]) return 0
  if(m === 1 && n === 1) return 1

  //开始遍历
  for(let i = 1; i <= m; i++){
    for(let k = 1; k <= n; k++){
      const mIndex = i -1
      const nIndex = k -1
      // 是否有障碍物
      const isDisabled = obstacleGrid[mIndex][nIndex] === 1
      if(isDisabled) {
        // 障碍物直接给0
        cacheArray[mIndex][nIndex] = 0
      }else {
        // 处理边界值
        if(i ===1){
          // i=1时 第一行 如果上一列为0被阻挡了那么是无法下来的 得返回0不然就返回1
          cacheArray[mIndex][nIndex] = cacheArray[0][nIndex-1] === 0 ? 0: 1
        }else if(k ===1){
          // 同理
          cacheArray[mIndex][nIndex] = cacheArray[mIndex-1][0] === 0 ? 0: 1
        }else {
          // 都不是的话 f(m,n) = f(m-1,n) + f(m, n-1)
          cacheArray[mIndex][nIndex] = cacheArray[mIndex -1][nIndex] + cacheArray[mIndex][nIndex - 1]
        }
      }
    }
  }
  return cacheArray[m-1][n-1]
}
