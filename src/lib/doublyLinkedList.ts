/**
 * A standard Doubly Linked List implementation for navigation and queue management.
 */

export class DLLNode<T> {
  value: T;
  next: DLLNode<T> | null = null;
  prev: DLLNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class DoublyLinkedList<T> {
  head: DLLNode<T> | null = null;
  tail: DLLNode<T> | null = null;
  size: number = 0;

  add(value: T): DLLNode<T> {
    const newNode = new DLLNode(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.prev = this.tail;
      if (this.tail) this.tail.next = newNode;
      this.tail = newNode;
    }
    this.size++;
    return newNode;
  }

  // Add to front (useful for recently viewed)
  prepend(value: T): DLLNode<T> {
    const newNode = new DLLNode(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.size++;
    return newNode;
  }

  // Remove a specific node (efficient O(1) if you have the node reference)
  remove(node: DLLNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
    this.size--;
  }

  // Helper to convert to array for rendering
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }
}
