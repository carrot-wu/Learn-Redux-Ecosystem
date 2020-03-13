var reverseList = function (head) {
    let currentNode = null;
    let headNode = head;
    while (head && head.next) {
      currentNode = head.next;
      head.next = currentNode.next;
      currentNode.next = headNode;
      headNode = currentNode;
    }
    return headNode;
  };
  const a = {
    val: 'a',
    next: {
      val: 'b',
      next: {
        val: 'c',
        next: null
      }
    }
  }
  reverseList(a)