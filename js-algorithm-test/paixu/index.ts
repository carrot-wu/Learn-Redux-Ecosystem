/**
 * 冒泡排序
 * 本质上是左右比较大小交换位置
 * 每一次排序完其实就确定了最大的值
 * 可以进行优化如果某次排序中没有交换位置那么久认为他已经正确排序了
 */
function bubbleSort(arr: number[]): number[] {
  for (let i = 0; i < arr.length; i++) {
    let complete = true
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j + 1], arr[j]] = [arr[j], arr[j + 1]]
        complete = false
      }
    }
    if (complete) {
      return arr
    }
  }
  return arr
}

/**
 * 插入排序
 * 将左侧序列看成一个有序序列，每次将一个数字插入该有序序列。插入时，从有序序列最右侧开始比较，若比较的数较大，后移一位。
 * @param {number[]} arr
 * @returns {number[]}
 */
function insertSort(arr: number[]): number[] {
  for (let i = 1; i < arr.length; i++) {
    // 保存当前插入的元素索引
    let targetIndex = i
    for (let k = i - 1; k >= 0; k--) {
      if (arr[targetIndex] < arr[k]) {
        //小于 调整位置
        [arr[targetIndex], arr[k]] = [arr[k], arr[targetIndex]]
        // 更新当前target的索引值
        targetIndex = k
      } else {
        // 大于已经是正确位置了 直接退出循环
        break
      }
    }
  }
  return arr
}

/** 选择排序
 * 每次选择最小的数字进行替换
 * @param {number[]} arr
 * @returns {number[]}
 */
function selectionSort(arr: number[]): number[] {
  for (let i = 0; i < arr.length; i++) {
    let minIndex = i
    for (let k = i + 1; k < arr.length;  k++) {
      if(arr[k] <arr[minIndex]){
        minIndex = k
      }
    }
    [arr[minIndex], arr[i]] = [arr[i], arr[minIndex]]
  }
  return arr
}

// 通过一趟排序将要排序的数据分割成独立的两部分，其中一部分的所有数据比另一部分的所有数据要小，再按这种方法对这两部分数据分别进行快速排序，整个排序过程可以递归进行，使整个数据变成有序序列。
/*
* 1. 先找到一个基点，一般是第一个元素
* 2. 比基数小的放在左边，基数大的放在右边
* 3. 继续递归左右的两个数组
* */
/**
 * 快速排序 递归版
 * 核心原理分治
 * @param {number[]} arr
 * @returns {number[]}
 */
function quickSort1(arr: number[]): number[] {
  if(arr.length < 2) return arr
  //创建两个数组用来保存
  const left = []
  const right = []
  //第一个基数
  const first = arr[0]
  for(let i = 1; i< arr.length; i++){
    if(arr[i] > first){
      right.push(arr[i])
    }else {
      left.push(arr[i])
    }
  }
  return [...quickSort1(left), first, ...quickSort1(right)]
}

//递归很好理解，那不用递归用循环呢
// 取中间为基点 左右指针就行替换值
function quickSort2(arr: number[]): number[] {
  function sort(arr: number[], left: number, right: number){
    if(right - left <=1) return
    let start = left
    let end = right
    const medium = arr[Math.floor((start + end)/2)]
    while(start < end){
      // 查找start大于中间的值
      while (arr[start] < medium && start < end){
        start++
      }
      arr[end] = arr[start]
      while(arr[end] > medium && start < end){
        end--
      }
      arr[start] = arr[end]
    }
    arr[start] = medium
    sort(arr, left, start - 1)
    sort(arr,start + 1, right)
  }
  sort(arr, 0, arr.length-1)
  return arr
}

/**
 * 归并的思想其实就是把大的问题小化成小的问题
 * 通过把大数组的排序分解成小数组的排序最后再合并起来
 * @param {number[]} arr
 * @returns {number[]}
 */
function mergeSort(arr: number[]): number[] {
  if(arr.length < 2) return arr
  const medium = Math.floor(arr.length / 2)
  return merge(mergeSort(arr.slice(0, medium)), mergeSort(arr.slice(medium)))
}
function merge(arr1: number[], arr2:number[]): number[] {
  let temp = []
  while(arr1[0] && arr2[0]){
    if(arr1[0] < arr2[0]){
      temp.push(arr1.shift())
    }else {
      temp.push(arr2.shift())
    }
  }
  // 有一个数组为空了
  if(arr1.length){
    temp = temp.concat(arr1)
  }else {
    temp = temp.concat(arr2)
  }
  return temp
}

/*电话号码的字母组合*/
/**
 * @param {string} digits
 * @return {string[]}
 */

// 核心原理就是先把第一第二个数组合并成一个 然后继续进行循环
var letterCombinations = function(digits: string) {
  if(!digits) return []
  const maps: {[k in string]: string} = {
    '2': "abc",
    '3': "def",
    '4': "ghi",
    '5': "jkl",
    '6': "mno",
    '7': "pqrs",
    '8': "tuv",
    '9': "wxyz"
  }

  const result = []
  for(let i =0; i< digits.length; i++){
    result.push(maps[digits[i]].split(''))
  }
  while(result.length >1){
    const temp = []
    for( let f =0; f< result[0].length; f ++){
      for( let s =0; s< result[1].length; s ++){
        temp.push(`${result[0][f]}${result[1][s]}`)
      }
    }
    // 已经计算第一第二的元素情况了
    result.splice(0, 2, temp)
  }
  return result[0]
};
