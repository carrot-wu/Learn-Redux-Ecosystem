//冒泡
/**
 *
 * @param array 传入的排序数组
 */
//冒泡排序的原理就是循环两次 依次比较左右大小进行替换
function ma(array){
  if(!Array.isArray(array))throw new Error('参数必须为数组')
  for(let i =0;i<array.length-1;i++){
    for(let v =0;v<array.length-1;v++){
      if( array[v] > array[v+1] ){
        [array[v],array[v+1]] = [array[v+1],array[v]]
      }
    }
  }
  console.log(array)
}

const maArray = [1,2,3,1111, 12,32,11,411,21,67,987,45,1,2,56,43,65 ]
//ma(maArray)

//选择排序 理论就是每一次循环中获取当前循环的值  循环全部数组获取最小的值然后又进行替换
function xuan(array){
  if(!Array.isArray(array))throw new Error('参数必须为数组')
  for(let i =0;i<array.length-1;i++){
    let index = i
    for(let j = i+1;j<array.length;j++){
      if(array[index] > array[j]) index = j
    }
    [array[i],array[index]] = [array[index],array[i]]
  }
  console.log(array)
}
insert(maArray)

//插入排序 将第一个元素视为有序序列，遍历数组，将之后的元素依次插入这个构建的有序序列中。
function insert(array){
  if(!Array.isArray(array))throw new Error('参数必须为数组')
  let i;let j;
  for(i = 1;i<array.length;i++){
    let ele = array[i]
    for(j = i - 1 ;j>=0;j--){
        let temp = array[j]
      if(ele < temp){
        array[j + 1] = temp
      } else{
        break
      }
    }
    array[j + 1] = ele
  }
  console.log(array)
}