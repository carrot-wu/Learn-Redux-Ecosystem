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

在react fiber和react hooks中用到的大量的链表结构，其中fiber node是一条双向链表（通过child指向子节点，sibling指向兄弟节点，通过return返回父节点）。react hooks是单向链表，hooks内部的update对象queue则是单向循环链表。

### 从尾到头打印链表
#### 输入一个链表，按链表值从尾到头的顺序返回一个ArrayList
>通过递归.next获取下一个链表，直到.next为null

```ts
interface List {
  next: List | null,
  val: string
}

/**
 * 从尾部到头部打印链表
 * @param {List} list
 * @returns {string[]}
 */
function printList(list: List) {
  const array = []
  while (list) {
    array.unshift(list.val)
    list = list.next
  }
  return array
}
```

### 反转链表
#### 输入一个链表，反转链表后，输出新链表的表头。

1. 每一次循环的本质就是一直保留头部第一个链表head（这里是a1）,每次循环的时候把第二个之后的链表拿出来currentNode (这里是a2-n)拿出来,之后把头部head（a1）链表执向a2-n的下一个即a3-n所以头部链表head就变成了(a1.next => a3-n)。这时候注意因为一开始headNode跟head的引用是相同的所以这时候headNode也是(a1.next => a3-n)。最后把currentNode.next执向headNode所以就变成了(a2.next=>a1.next => a3-n)
2. head == a1.next =>a3.next.... currentNode === headNode === a2.next => a1.next => a3.next...
3. 从上面可以看出headNode跟head之间是有引用关系的即(headNode.next === head),两者引用是相同的。所以修改head的引用值也会改变headNode.next的引用值
2. 继续循环,注意下面两句

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
  let headNode = head
  let currentNode = null
  while (head && head.next) {
    // 获取第二个链表
    currentNode = head.next
    //head的下一个链表指向下下一个即第三个
    head.next = currentNode.next
    // 第二个链表指向头部链表
    currentNode.next = headNode

    headNode = currentNode
  }
  return headNode
}
```

#### 输入一个链表，输出该链表中倒数第k个结点。
>如果先循环出链表的所有长度在进行求值的话，需要循环两次复杂度为2n。可以使用双指针进行优化
1. 初始指针a,第二个指针b与指针a间隔为k
2. 这时候两个指针都进行循环，如果b指针到达终点了，那么a指针当前位置就是倒数第k个节点位置

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

### 链表中环的入口节点（查找链表是否有环）
#### 给一个链表，若其中包含环，请找出该链表的环的入口结点，否则，输出null。
>问题可以拆分成两部分1如果判断链表是否有环，第二个如何查找环的起点。
1. 如何判断链表是否有环：我们只需要两个指针，一个走一步，一个走两步，只要指针有相遇的话那么就是有环。（假设链表没有环的话，那么因为快指针走的越来越远那么两个指针永远不可能相遇。如果链表有环，假设快慢指针都在环里面，如果以慢指针作为参考物，那么快指针每次走一步，如果有环的话，那么两个指针最终一定会相遇）
2. 如何判断环的起点。首先我们假设有两个指针都在环的起点，如果让某一个指针先走环的长度K，那么该指针还是会回到环的起点与另一个指针相遇。这时候快的指针相对于慢的指针其实是先走了K步，这时候快的指针相对于慢的指针先走了环的长度k步。我们再把两个指针平移同样的步数直到慢的起点。所以最终判断环的起点问题可以转化为：两个指针a,b。a在起点，b先走环的长度，如果a和b相遇了那么当前位置就是环的起点入口。
3. 环的长度可以通过在环内的一点每次走一步又走到当前点的话，那么走的步数就是环的长度。

```ts
function getListStart(list: List): List | null {
  // 首先判断链表是否有环
  // 慢的先走1步
  let slow = list.next
  // 快的先走两步
  let fast = list.next.next

  // 初始化环的长度
  let squareLength = 0
  while(fast !== slow) {
    if(fast && fast.next){
      fast = fast.next.next
      slow = slow.next
    }else {
      // 快指针已经到终点了还没遇到那么久没有环
      return null
    }
  }
  
  // 有环 这里需要拿环的长度 此时 fast和slow必定在环内
  slow = slow.next
  squareLength +=1
  while(slow !== fast) {
    slow = slow.next
    squareLength +=1
  }
  // 都回到原点
  slow = list
  fast = list
  // 快指针先走环的长度步数
  for(let i =1; i <= squareLength; i++){
    fast = fast.next
  }
  //获取环的起点
  while(slow !== fast) {
    slow = slow.next
    fast = fast.next
  }
  return slow
}
```

### 两个链表的第一个公共节点
#### 输入两个链表，找出它们的第一个公共结点。
>假设两个公共链表有公共节点，那么从这节点开始后续的元素位置相同并且长度必须相等合并成一条线，所以我们两条链表的尾部对齐，长一点的链表pass掉差异的长度，然后依次比较是否相等即可。
1. 通过循环获取链表的长度。
2. 获取长的链表先走长度的差异值步
3. 同时循环查找是否有相等的节点，有的话就是公共节点

```ts
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
```

### 约瑟夫环
#### 0,1,...,n-1这n个数字排成一个圆圈，从数字0开始，每次从这个圆圈里删除第m个数字。求出这个圆圈里剩下的最后一个数字。
>约瑟夫环总共有三种做法：1通过链表循环删除对应的节点，2通过数组取值使用索引，3通过递归。
1. 使用链表，我们只需要把元素组装成一个链表，然后通过循环没过m个节点删除元素即可，直到只剩下一个元素
2. 通过描述我们可以得出一条规律：从当前某个元素开始数，下一个被删除的数字等于m除以总人数的余数，假设第1次删除的数字是：第一个数字0开始数起的第m个数。举个例子：假设m是2，总人数是10,那么第(2 % 10) = 2第二个数字要被删除。对应索引的话就得到删除的索引Index = ((m)% n) -1。我们可以通过数组去循环即可。
3. d动态规划: 
 1. 第一轮的时候第一个被删除索引是(m-1)%n。所以第二轮的开始（0）位置索引就是m%n,所以推导出第二轮第k个位置在第1轮的索引就是(m+k)%n。
 2. 假设在第n轮时候的某个人位置是f(n)，那么第n-1轮的时候位置其实就是f(n-1) = (m+f(n))%n。即第7轮某个人位置是2 那么第6轮他的位置就是(m+ 2)%n, 那么第五轮他的位置就是(m + ((m+ 2)%n))%n。
 3. 现在我们知道8个人时，最后一轮就是第七轮因为每一轮走一个人此时剩下的人索引就是0，所以上一轮他的位置就是(m+2)%8,因此我们可以一直循环上去直到第一轮就是他获取的位置。

```ts
//链表解决
function getRemainPeopleIndexByList(total: number, space: number): number{
  interface List {
    next?: List ;
    val: number;
  }
  const head:List = {val : 0}
  let current: List = head
  for(let i=1; i<total; i++){
    current.next = {val: i}
    current = current.next
  }
  current.next = head
  while (current.next != current) {
    for (let i = 0; i < m - 1; i++) {
      current = current.next;
    }
    current.next = current.next.next;
  }
  return current.val;
}

// 数组
function getRemainPeopleIndexByArray(total: number, space: number): number{
  if (total < 1 || space < 1) {
    return -1;
  }
  const array = [];
  let index = 0;
  for (let i = 0; i < total; i++) {
    array[i] = i;
  }
  while (array.length > 1) {
    index = (index + space) % array.length - 1;
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



