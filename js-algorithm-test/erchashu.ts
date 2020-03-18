class TreeNode {
  public val: number;
  public left: TreeNode;
  public right: TreeNode;
  constructor(key: number, left: TreeNode = null, right: TreeNode = null) {
    this.val = key;
    this.left = left;
    this.right = right;
  }
  show() {
    console.log(this.val);
  }
}

class Tree {
  public root: TreeNode;
  constructor() {
    this.root = null;
	}
	// 插入键
	insert(val: number) {
		const newNode = new TreeNode(val)
		if(!this.root){
			//根为空
			this.root = newNode
		}
		this.insertNode(this.root, val)
	}
	// 往特定键中插入
	insertNode(node: TreeNode, val: number){
		const newNode = new TreeNode(val)
		// 小于当前键值
		if(node.val < val){
			if(node.left){
				// 有左键 继续遍历
				this.insertNode(node.left, val)
			}else {
				// 没有的话保存
				node.left = newNode
			}	
		}else {
			if(node.left){
				// 有右键 继续遍历
				this.insertNode(node.left, val)
			}else {
				// 没有的话保存
				node.left = newNode
			}	
		}
	}
	// 获取最小的值 在最左边
	private min(node: TreeNode): number {
		while(node){
			if(node.left){
				node = node.left
			}else {
				return node.val
			}
		}
	}
	getMin(): number {
		return this.min(this.root)
	}
	private max(node: TreeNode): number {
		while(node){
			if(node.right){
				node = node.right
			}else {
				return node.val
			}
		}
	}
	getMax(): number {
		return this.min(this.root)
	}

	// 搜索节点
	private search(node: TreeNode, val: number): boolean{
		if(!node) return false
		if(node.val === val){
			return true
		}else if(node.val > val){
			this.search(node.left, val)
		}else {
			this.search(node.right, val)
		}
	}
	searchVal(val: number):boolean {
		return this.search(this.root, val)
	}
}

//中序遍历
function inorderTraversal(root: TreeNode): number[] {
  let arr: number[] = []
  function traversersal(node: TreeNode){
    if(node){
      // 先打印node.left
      traversersal(node.left)
      // 在打印当前node
      arr.push(node.val)
      // 最后打印node.right
      traversersal(node.right)
    }
	}
	traversersal(root)
	return arr
}
// 循环解法
function inorderTraversal2(node: TreeNode): number[] {
	const result = []
	const stack = []
	let current = node
	while(current || stack.length){
		while(current){
			// 左键入栈
			stack.push(current)
			current = current.left
		}
		// 取出最后一个保存值
		current = stack.pop()
		result.push(current.val)
		//取右键继续循环
		current = current.right
	}
	return result
}

// 先序遍历
function preorderTraversal(root: TreeNode): number[] {
  let arr: number[] = []
  function traversersal(node: TreeNode){
    if(node){
			// 先保存自身的值
			arr.push(node.val)
      // 在报错left
      traversersal(node.left)
      // 最后保存node.right
      traversersal(node.right)
    }
	}
	traversersal(root)
	return arr
}
//循环
function preorderTraversal2(root: TreeNode): number[] {
	const result: number[] = []
	const stack: TreeNode[] = []
	let current = root
	while (current || stack.length) {
		while(current) {
			stack.push(current)
			result.push(current.val)
			current = current.left
		}
		current = stack.pop()
		current = current.right
	}
	return result
}

// 后续遍历
function lastorderTraversal(root: TreeNode): number[] {
  let arr: number[] = []
  function traversersal(node: TreeNode){
    if(node){
      traversersal(node.left)
			traversersal(node.right)
			arr.push(node.val)
    }
	}
	traversersal(root)
	return arr
}

//循环
function lastorderTraversal2(root: TreeNode): number[] {
	const result: number[] = []
	const stack: TreeNode[] = []
	// 保留一个变量作为最后的访问点
	let last = null
	let current = root
	while (current || stack.length) {
		while(current){
			stack.push(current)
			// 可以出栈
			current = current.left
		}
		// 获取当前最末尾的栈
		current =  stack[stack.length -1]
		if(!current.right || current.right === last){
			// 没有子健 或者 子健的right已经访问过了 那么可以出栈保存值
			current = stack.pop()
			result.push(current.val)
			// 最后访问点更新
			last = current
			current = null
		}else {
			// 右键还没访问 不允许出栈 先访问右边的键
			current = current.right
		}
	}
	return result
}

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

// 镜像二叉树
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

//获取第k小的值

function KthNode(root:TreeNode, k:number){
	if(!root) return null
	const result = []
	const stack = []
	let current = root
	while(current || stack.length){
		while(current){
			stack.push(current)
			current = current.left
		}

		current = stack.pop()
		result.push(current.val)
		current = current.right
	}
	return k-1 > result.length ? null : result[k-1] 
}

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

// 判断是否合法的二叉树

function isValidBST(root: TreeNode): boolean {
	if(!root) return false
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