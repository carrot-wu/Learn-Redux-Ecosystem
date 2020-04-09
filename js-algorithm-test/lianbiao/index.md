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

## 链表

链表存储有序的元素集合，但不同于数组，链表中的元素在内存中并不是连续放置的。每个元素由一个存储元素本身的节点和一个指向下一个元素的引用（也称指针或链接）组成。下图展 示了一个链表的结构。
相对于传统的数组，链表的一个好处在于，添加或移除元素的时候不需要移动其他元素。然而，链表需要使用指针，因此实现链表时需要额外注意。在数组中，我们可以直接访问任何位置 的任何元素，而要想访问链表中间的一个元素，则需要从起点（表头）开始迭代链表直到找到所需的元素。

![alt](http://img.carrotwu.com/Fs-JoZqQn23hhaLKRdrZEENMsxYN)

在 react fiber 和 react hooks 中用到的大量的链表结构，其中 fiber node 是一条双向链表（通过 child 指向子节点，sibling 指向兄弟节点，通过 return 返回父节点）。react hooks 是单向链表，hooks 内部的 update 对象 queue 则是单向循环链表。

### 从尾到头打印链表

#### 输入一个链表，按链表值从尾到头的顺序返回一个 ArrayList

> 通过递归.next 获取下一个链表，直到.next 为 null

```ts
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
```

### 反转链表

#### 输入一个链表，反转链表后，输出新链表的表头。

1. 每一次循环的本质就是一直保留头部第一个链表 head（这里是 a1）,每次循环的时候把第二个之后的链表拿出来 currentNode (这里是 a2-n)拿出来,之后把头部 head（a1）链表执向 a2-n 的下一个即 a3-n 所以头部链表 head 就变成了(a1.next => a3-n)。这时候注意因为一开始 headNode 跟 head 的引用是相同的所以这时候 headNode 也是(a1.next => a3-n)。最后把 currentNode.next 执向 headNode 所以就变成了(a2.next=>a1.next => a3-n)
2. head == a1.next =>a3.next.... currentNode === headNode === a2.next => a1.next => a3.next...
3. 从上面可以看出 headNode 跟 head 之间是有引用关系的即(headNode.next === head),两者引用是相同的。所以修改 head 的引用值也会改变 headNode.next 的引用值
4. 继续循环,注意下面两句

```js
// 第三点 headNodg跟head的引用是有联系的
let headNode = head;
// 这里修改了head引用，所以headNode也会发生改变
// a1.next => a4.next =>a5
// 所以 headNode.next === a1.next => a4.next =>a5 最终就是 a3.next =>a2.next =>a1.next => a4.next =>a5
head.next = currentNode.next;
currentNode.next = headNode;
```

解答:

```ts
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
```

#### 输入一个链表，输出该链表中倒数第 k 个结点。

> 如果先循环出链表的所有长度在进行求值的话，需要循环两次复杂度为 2n。可以使用双指针进行优化

1. 初始指针 a,第二个指针 b 与指针 a 间隔为 k
2. 这时候两个指针都进行循环，如果 b 指针到达终点了，那么 a 指针当前位置就是倒数第 k 个节点位置

```ts
 * 获取倒数第n个节点的链表
 * @param {List} list
 * @param {number} k
 * @returns {string | null}
 */
function getLastListVal(list: List, k: number): string | null {
  if (Number(k) > 0) {
    let slow = list
    let fast = list
    let index = 1
    while (fast && fast.next) {
      fast = fast.next
      if (index >= k) {
        slow = slow.next
      }
      index++
    }
    return index < k ? null : slow.val
  } else {
    return null
  }
}
```

### 旋转链表

### 给定一个链表，旋转链表，将链表每个节点向右移动 k 个位置，其中 k 是非负数。

> 其实有多重解法，类似于上面求倒数 k 点，重要的是要知道在打哪里打断点其实就是倒数第 k 个点，我这里为了方便先弄成环形链表

1. 第一个指针走到链表末尾把链表弄成环，并且求出链表的长度
2. 第二个指针从头开始，求出打断点的位置其实就是倒数第 k 个位置级走(链表长度 length - k%length)的步数,因为 k 有可能会大于长度所以直接求余数
3. 保存断点之后的节点 cut.next, 然后断开节点 cur.next = null 就可以了

```ts
var rotateRight = function(head, k) {
  if (!head || k === 0) return head;
  // 第一步形成环形链表
  let start = head;
  let end = head;
  // 链表总长
  let length = 1;
  while (start && start.next) {
    start = start.next;
    length += 1;
  }
  // 找到链表尾巴然后拼接头形成环形链表
  start.next = head;

  // 这时候已经是环形链表了

  let step = 1;
  // 真正走的步数= 总长减去移动的步数 ，注意的是移动部署需要取余长度，有可能移动部署是100
  while (step < length - (k % length)) {
    end = end.next;
    step++;
  }

  // 获取打断节点

  // 打断链表
  head = end.next;
  end.next = null;
  return head;
};
```

### 链表中环的入口节点（查找链表是否有环）

#### 给一个链表，若其中包含环，请找出该链表的环的入口结点，否则，输出 null。

> 问题可以拆分成两部分 1 如果判断链表是否有环，第二个如何查找环的起点。

1. 如何判断链表是否有环：我们只需要两个指针，一个走一步，一个走两步，只要指针有相遇的话那么就是有环。（假设链表没有环的话，那么因为快指针走的越来越远那么两个指针永远不可能相遇。如果链表有环，假设快慢指针都在环里面，如果以慢指针作为参考物，那么快指针每次走一步，如果有环的话，那么两个指针最终一定会相遇）
2. 如何判断环的起点。首先我们假设有两个指针都在环的起点，如果让某一个指针先走环的长度 K，那么该指针还是会回到环的起点与另一个指针相遇。这时候快的指针相对于慢的指针其实是先走了 K 步，这时候快的指针相对于慢的指针先走了环的长度 k 步。我们再把两个指针平移同样的步数直到慢的起点。所以最终判断环的起点问题可以转化为：两个指针 a,b。a 在起点，b 先走环的长度，如果 a 和 b 相遇了那么当前位置就是环的起点入口。
3. 环的长度可以通过在环内的一点每次走一步又走到当前点的话，那么走的步数就是环的长度。

```ts
function getListStart(list: List): List | null {
  // 首先判断链表是否有环
  // 慢的走1步 快的走两步
  if(!head) return null
  let slow = head
  let fast = head.next
  while(slow !== fast){
    if(fast && fast.next){
      slow = slow.next
      fast = fast.next.next
    }else {
      // 没环
      return null
    }
  }
  // 有环 此时指针都在环内 拿环的长度
  let length = 1
  fast = fast.next
  while(slow !== fast){
    fast = fast.next
    length +=1
  }
  //回到原点 length就是环的长度
  slow = head
  fast = head
  // fast先走length步 相遇的时候就是环的起点
  for(let i =0; i<length; i++){
    fast = fast.next
  }

  while(slow !== fast){
    fast = fast.next
    slow = slow.next
  }
  return fast
```

### 两个链表的第一个公共节点

#### 输入两个链表，找出它们的第一个公共结点。

> 假设两个公共链表有公共节点，那么从这节点开始后续的元素位置相同并且长度必须相等合并成一条线，所以我们两条链表的尾部对齐，长一点的链表 pass 掉差异的长度，然后依次比较是否相等即可。

1. 通过循环获取链表的长度。
2. 获取长的链表先走长度的差异值步
3. 同时循环查找是否有相等的节点，有的话就是公共节点

```ts
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} headA
 * @param {ListNode} headB
 * @return {ListNode}
 */
var getIntersectionNode = function(headA, headB) {
  let a = headA
  let b = headB
    //先获取环的长度
  function getNodeLength(head){
    let length = 0
    while(head){
      head = head.next
      length +=1
    }
    return length
  }
  const aLength = getNodeLength(a)
  const bLength = getNodeLength(b)
  
  const between = Math.abs(aLength-bLength)
  // 长的先走 between步
  if(aLength >bLength){
    for(let i =0; i< between; i++){
      a = a.next
    }
  }else {
    for(let i =0; i< between; i++){
      b = b.next
    }
  }
  
  // 判断接下来的元素是否相等
  while(a){
    if(a === b){
      return a
    }else {
      a = a.next
      b = b.next
    }
  }
  return null
};
```

### 约瑟夫环

#### 0,1,...,n-1 这 n 个数字排成一个圆圈，从数字 0 开始，每次从这个圆圈里删除第 m 个数字。求出这个圆圈里剩下的最后一个数字。

> 约瑟夫环总共有三种做法：1 通过链表循环删除对应的节点，2 通过数组取值使用索引，3 通过递归。

1. 使用链表，我们只需要把元素组装成一个链表，然后通过循环没过 m 个节点删除元素即可，直到只剩下一个元素
2. 通过描述我们可以得出一条规律：从当前某个元素开始数，下一个被删除的数字等于 m 除以总人数的余数，假设第 1 次删除的数字是：第一个数字 0 开始数起的第 m 个数。举个例子：假设 m 是 2，总人数是 10,那么第(2 % 10) = 2 第二个数字要被删除。对应索引的话就得到删除的索引 Index = ((m)% n) -1。我们可以通过数组去循环即可。
3. d 动态规划:
4. 第一轮的时候第一个被删除索引是(m-1)%n。所以第二轮的开始（0）位置索引就是 m%n,所以推导出第二轮第 k 个位置在第 1 轮的索引就是(m+k)%n。
5. 假设在第 n 轮时候的某个人位置是 f(n)，那么第 n-1 轮的时候位置其实就是 f(n-1) = (m+f(n))%n。即第 7 轮某个人位置是 2 那么第 6 轮他的位置就是(m+ 2)%n, 那么第五轮他的位置就是(m + ((m+ 2)%n))%n。
6. 现在我们知道 8 个人时，最后一轮就是第七轮因为每一轮走一个人此时剩下的人索引就是 0，所以上一轮他的位置就是(m+2)%8,因此我们可以一直循环上去直到第一轮就是他获取的位置。

```ts
//链表解决
function getRemainPeopleIndexByList(total: number, space: number): number {
  interface List {
    next?: List;
    val: number;
  }
  const head: List = { val: 0 };
  let current: List = head;
  for (let i = 1; i < total; i++) {
    current.next = { val: i };
    current = current.next;
  }
  current.next = head;
  while (current.next != current) {
    for (let i = 0; i < m - 1; i++) {
      current = current.next;
    }
    current.next = current.next.next;
  }
  return current.val;
}

// 数组
function getRemainPeopleIndexByArray(total: number, space: number): number {
  if (total < 1 || space < 1) {
    return -1;
  }
  const array = [];
  let index = 0;
  for (let i = 0; i < total; i++) {
    array[i] = i;
  }
  while (array.length > 1) {
    index = ((index + space) % array.length) - 1;
    if (index >= 0) {
      array.splice(index, 1);
    } else {
      array.splice(array.length - 1, 1);
      index = 0;
    }
  }
  return array[0];
}

//动态规划
function getRemainPeopleIndex(total: number, space: number): number {
  // 总共要进行的轮数才剩一人
  let totalLunshu = total - 1;
  // 最后第totalLunshu轮时胜利人的索引是0
  let lastPeopleIndex = 0;
  // 1. 第一轮的时候第一个被删除索引是(m-1)%n。所以第二轮的开始（0）位置索引就是m%n,所以推导出第二轮第k个位置在第1轮的索引就是(m+k)%n。
  // 2. 假设在第n轮时候的某个人位置是f(n)，那么第n-1轮的时候位置其实就是f(n-1) = (m+f(n))%(total - n)。即第7轮某个人位置是2 那么第6轮他的位置就是(m+ 2)%(total - 6), 那么第五轮他的位置就是(m + ((m+ 2)%n))%n。
  // 3. 现在我们知道8个人时，最后一轮就是第七轮因为每一轮走一个人此时剩下的人索引就是0，所以上一轮他的位置就是(m+2)%8,因此我们可以一直循环上去直到第一轮就是他获取的位置。

  // 一直循环到00位置 走totalLunshu轮
  while (totalLunshu > 0) {
    //上一轮的索引 f(n-1) = f(n-1) = (m+f(n))%（每一轮的人数）
    lastPeopleIndex = (space + lastPeopleIndex) % (total - totalLunshu + 1);
    totalLunshu -= 1;
  }
  return lastPeopleIndex;
}
```

### 合并两个排序的链表

#### 输入两个单调递增的链表，输出两个链表合成后的链表，当然我们需要合成后的链表满足单调不减规则。

> 核心在于比较两个表头，把比较小的值塞进一个链表中，然后大的值继续与小的值的链表继续比较

1. 假设有 p1 和 p2 两个链表, 比较 p1 和 p2 的值。
2. 如果 p1 小于 p2，那么把 p1 的值保存起来，然后 p1 的下一个值继续与 p2 进行比较
3. 如果 p1 大于 p2，那么把 p2 的值保存起来，然后 p2 的下一个值继续与 p1 进行比较

```ts
/**
 * 合并两个单调递增的链表
 * @param first
 * @param second
 */
function sortTwoList(p1: List, p2: List): List {
  if (!p1) return p2;
  if (!p2) return p1;
  let head;
  if (p1.val < p2.val) {
    head = p1;
    head.next = sortTwoList(p1.next, p2);
  } else if (p1.val > p2.val) {
    head = p2;
    head.next = sortTwoList(p1, p2.next);
  } else {
    head = p1;
    head.next = sortTwoList(p1.next, p2.next);
  }
  return head;
}
```
