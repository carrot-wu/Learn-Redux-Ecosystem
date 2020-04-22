//搜索旋转排序数组
/*
* 假设按照升序排序的数组在预先未知的某个点上进行了旋转。

( 例如，数组 [0,1,2,4,5,6,7] 可能变为 [4,5,6,7,0,1,2] )。

搜索一个给定的目标值，如果数组中存在这个目标值，则返回它的索引，否则返回 -1 。

来源：力扣（LeetCode）
链接：https://leetcode-cn.com/problems/search-in-rotated-sorted-array
著作权归领扣网络所有。商业转载请联系官方授权，非商业转载请注明出处。*/

// 本质上还是需要通过二分查找法 注意的地方是左右指针的边界问题
// 通过nums[right] > nums[left] 判断是不是正常排序的数组 如果是正常的数组可以走正常的二分查找 极大地优化
// 任意找一个位置 总有一个方向是升序的 nums[mid] > nums[start] 左边有序 不然右边有序
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function (nums, target) {
  if (nums.length < 2) {
    return nums[0] === target ? 0 : -1
  }
  let start = 0
  let end = nums.length - 1

  while (start < end) {
    let mid = Math.floor((end - start) / 2) + start
    //取中值
    if (nums[mid] === target) return mid
    if (nums[start] === target) return start
    if (nums[end] === target) return end

    // 优化
    if (nums[start] < nums[end]) {
      // 如果右边的比左边大那么认为数组时正确排序了的 执行正产二分法
      if (nums[mid] > target) {
        end = mid - 1
      } else {
        start = start + 1
      }
      continue // 继续循环
    }
    if (nums[mid] > nums[start]) {
      //左边是升序
      if (target > nums[start] && target < nums[mid]) {
        // 只有target比左边大 比终点小才会在左边位置 不然肯定在右边
        end = mid - 1
      } else {
        start = start + 1
      }
    } else {
      // 右边是升序
      if (target > nums[mid] && target < nums[end]) {
        // 右边是升序 只有大于终点 小于右边 target才有可能在右边 不然肯定在左边
        start = mid + 1
      } else {
        end = mid - 1
      }
    }
  }

  return -1
}

// 二叉树的最近公共祖先
/*给定一个二叉树, 找到该树中两个指定节点的最近公共祖先。

百度百科中最近公共祖先的定义为：“对于有根树 T 的两个结点 p、q，最近公共祖先表示为一个结点 x，满足 x 是 p、q 的祖先且 x 的深度尽可能大（一个节点也可以是它自己的祖先）。”

例如，给定如下二叉树:  root = [3,5,1,6,2,0,8,null,null,7,4]

来源：力扣（LeetCode）
链接：https://leetcode-cn.com/problems/lowest-common-ancestor-of-a-binary-tree
著作权归领扣网络所有。商业转载请联系官方授权，非商业转载请注明出处。*/

// 这题相比于之前的搜索二叉树 我们是能够明确知道两个元素在左边还是右边
// 这题不可以 但是我们可以换个思路 通过递归查找到 pq节点 找到返回 直到当前root的 left right 都有qp说明当前root就是要找的节点
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
var lowestCommonAncestor = function (root, p, q) {
  if (root === null || root.val === q.val || root.val === p.val) {
    //找到了 直接返回 当前节点
    return root
  }
  // 递归查找左右节点
  const left = lowestCommonAncestor(root.left, p, q)
  const right = lowestCommonAncestor(root.right, p, q)
  // 如果都存在的话 那么当前root就是祖先
  if (left && right) {
    return root
  }
  // 如果都没有那么直接返回null
  if (!left && !right) {
    return null
  }

  // 一个有一个没有
  return left ? left : right

}

//136. 只出现一次的数字
//给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。

// 创建额外空间
var singleNumber = function (nums) {
  const map = {}

  for (let i = 0; i < nums.length; i++) {
    if (map[nums[i]]) {
      delete map[nums[i]]
    } else {
      map[nums[i]] = 1
    }
  }

  return Object.keys(map)[0]
}

// 利用异或运算的性质 0^n = n  n^n=0 a^b=1
// 异步运算符合交换律 即 a^b^c^a^b = a^a^b^b^c = 0^c = c
var singleNumber2 = function (nums) {
  let result = 0
  for (let i = 0; i < nums.length; i++) {
    result = result ^ nums[i]
  }
  return result
  // return nums.reduce((prev,cur) => prev^cur)
}

/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var findKthLargest = function (nums, k) {

// 块排
  let left = 0
  let right = nums.length - 1
  let tempIndex = fastSort(nums, left, right)
  while (k - 1 !== tempIndex) {
    //继续递归
    if (tempIndex > k - 1) {
      //数字更大 数字在左边
      right = tempIndex - 1

    } else {
      //在右边
      left = tempIndex + 1
    }
    tempIndex = fastSort(nums, left, right)
  }

  // 当前元素就是第k个最大的元素了

  return nums[k - 1]

}

function fastSort (nums, left, right) {
  var pivot = nums[left]
  while (left < right) {
    while (left < right && nums[right] <= pivot) {
      right--
    }
    nums[left] = nums[right]

    while (left < right && nums[left] > pivot) {
      left++
    }
    nums[right] = nums[left]
  }
  nums[left] = pivot
  return left
}
