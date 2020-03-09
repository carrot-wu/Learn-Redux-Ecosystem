## 动态规划

### 先从台阶算法题说起

在讲解动态规划之前，我觉得可以先从一个面试题开始讲起——阶梯问题：**假如楼梯有10个台阶，每次可以走1个或2个台阶，请问走完这10个台阶有几种走法**。  题目看似很难入手，我们可以通过下面的步骤思维去理解。
1. 因为一次只能走1个台阶或者2个台阶，所以可想而知走后一步时只有两种情况：**从第九个台阶走一步上去以及从第八个台阶走两步上去**。
2. 所以求走完10个台阶的求解就编程了：**走完第8个台阶的走法+走完第九个台阶的走法**。
3. 以此类推，走完第8个台阶的走法=**走完第7个台阶的走法+走完第6个台阶的走法**。等等等等，这样子可以一直递归下去。
4. 注意的是，只有一个台阶时只有一种走法：**走一步**。只有两个台阶时只有一种走法：**走两次一步或者直接走两步**

因此我们可以得到这么一条公式。
```ts
function getStairsMethods(stairNumber:number):number {
  //如果台阶数在两次以下，走法对应本身
  if(n <= 2) return n
  return getStairsMethods(stairNumber - 1) + getStairsMethods(stairNumber - 2)
}
```

暴力递归这种方法通俗易懂，但是非常低效，我们可以来看下它的递归树：
----------------1-------------------------------。
这个递归树怎么理解？这是一种自顶向下的方法，我们想求出f(10)，得先求出子问题f(9)和f(8),并且满足f(10)=f(9)+f(8)，同理可得f(9)=f(8)+f(7),f(8)=f(7)+f(6),······f(3)=f(2)+f(1)。最后遇到f(2)或者f(1)时，一颗完整的递归树就出来了，这其实就是一个二叉树。

这种递归求解的方式时间复杂度为O(2^n)，其实不难看出这种自顶向下的递归算法其实有一个很大的问题就是：对于任意一个数f(10)或者f(9)f(8)都会递归计算到f(2)f(1)的值，这里面其实做了很多多余的计算：f(9)f(8)都要递归一次f(7)的值。我们不妨换一种思路：不从第10次台阶开始推算：
1. 从f(1)+f(2)推算出f(3)。保存f(3)的值。
2. 从f(12+f(3)推算出f(4)。保存f(4)的值
3.  .....等等。

我们不难看出我们换了一种思路从下层开始推算出上层：要计算f(10)的值，我们得出解法就是先求f(1)f(2)的值再求出f(3)，对于每次求出的值就行缓存。最后通过f(8)+f(9)求出f(10即可)。

### 什么是动态规划

上面的第二种思路：**通过利用各个阶段阶段的递推关系，逐个确定每个阶段的最优决策，并最终得到原问题的最优决策，这就是动态规划**,动态规划擅长解决“多阶段决策问题”。简单来说动态规划就是“大事化小，小事化小”，从小任务开始解决然后扩大规模解决大问题。

1. 动态规划本质上不是递归，甚至可以理解是和递归相反的一种算法设计思想。
2. 递归是自顶向下的，从顶部开始分解问题，然后通过解决分解出的小问题，从而解决出整个问题
3. 动态规划是自底向上的，从底部开始解决问题，按照顺序一步一步扩大问题的规模从而去解决整个问题

通过动态规划的思路我们不难得出上面台阶算法题的另外一种解法：
```ts
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
```
-----------------2--------------------

### 不同路径问题
接下来我们看下leetcode上的一道算法题：
------------3-----------------------
根据上面的动态规划的思想我们试着解决这么一道题：
1. 因为每次只能向右走一步或者向下走一步，所以我们可以得出走到终点时有那么两种情况：1终点上一格的位置向下走一格到终点，2终点左一格的位置向又走一格到终点。
2. 因此不难得出这么一条公式，对于 m x n 格的网格，路径总数f(m,n) = f(m-1,n) + f(m, n-1)。
3. 其中f(1,1) = 0,f(2,1) = 1,f(1,2) = 1。
4. 网格中的障碍物怎么办呢。假设障碍物的处在(a,b)位置，意思就是说走到(a,b)的路径是永远不可能的，因此f(a,b) = 0。
5. 注意一些边界条件，如果第一行或者第一列有阻挡物的话，那么后续的方块路径都是0无法到达（第一行有个方块有阻挡物，因为只能向右或者向下，那么右边第一列的都过不去了）

根据上面的思路我们可以得出路径解法如下
```ts
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
```

### 背包问题
接下来我们继续看下一道题，动态规划的比之前更难的一道题就是背包问题，网上已经有很多人进行了解析，接下来我们也开始搞定这么一道题。
>先举一个很通俗易懂的例子，也是图解算法中的例子，有一个载重量是10kg 的背包，有五个物品，a 2kg 6元，b 2kg 3元，c 6kg 5元，d 5kg 4元，e 4kg 6元。问怎么放物品，价值最高？？

接下来的内容我们将通过表格来方便大家理解

1. 假设我们只有a物品，对于0-10kg的背包而言，明显放下去的价值比较高，这个很好理解。所以如果背包容量足够的话，那么当前价值最高就是a物品的6元。

--------------------4----------------------
2. 假设这时候多了b物品，对于b物品而言只有两种情况：a:放进背包或者b:不放进背包。
3. 对于a情况而言：假设放进去了b物品，这时候**剩下的背包容量=总容量-b物品的容量**,剩下了的容量我们可以去到a物品的那一行去查找相对应的价值。所以对于a情况而言，价值最高就是**b物品的价值3元加上剩余容量在上一行查找的价值k**(假设背包容器是7kg，这时候放下b物品的话，那么剩余容量就是7-2=5, 所以我们可以在上一行a物品的那一行去查找5kg对应的最大价值是6元，所以放下b物品的最高价值就是3+6=9；假设是3kg的背包的话，那么只剩下1kg的容量查找a那一行的1kg容量的包价值是0元)，这里计算出来的总价值我们为AA
4. 对于b情况而言：不放进去b物品，所以我们可以直接通过当前背包容量去上一行查找对应的最高价值为BB
5. 对于背包b而言放不放的两种情况总价值我们都计算出来了AA和BB，取最大值的价值CC就是只有物品a和物品b时的最大价值，继续填进去表格中。
  ---------------------5------------
6. 一次类推，我们就可以abcde的表格全部罗列出来。
  ------------------------6-----------------------

上面中动态规划的思想就是：我们不通过直接递归求出abcde的所有价值情况。而是先从只有a物品的情况开始计算价值，加上b物品的话存在两种情况：放与不放。通过计算出放与不放的最大值求出只有ab物品时的最大价值。以此类推，在加入c物品时，计算出放入c的价值以加上剩余容量只有ab的价值以及只有不放c只有ab的价值。最终推算出一个0-10kg，所有物品价值的二维数组表格。

```ts
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
```
