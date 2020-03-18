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

### 验证二叉搜索树
#### 给定一个二叉树，判断其是否是一个有效的二叉搜索树。
> 其实简单一点的方法就是用中序遍历,我们知道的是中序遍历会返回一个从小到大的数组，判断当前值是否大于上一个值即可。
```ts
// 判断是否合法的二叉树
function isValidBST(root: TreeNode): boolean {
	if(!root) return false
	// 不用数组存 而是通过保存上一次的值会更快一点点
	const result = []
	const stack = []
	let current = root
	while(current || stack.length){
		while(current){
			stack.push(current)
			current = current.left
		}

		current = stack.pop()
		if(current.val <= result[result.length -1]){
			// 小于等于值 直接返回false
			return false
		}
		result.push(current.val)
		current = current.right
	}
	return true
}
```