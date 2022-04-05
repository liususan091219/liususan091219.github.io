package testpackage;

import java.util.Arrays;
import java.util.NoSuchElementException;

import testpackage.BinaryTree.Node;

public class MinHeap {
  private int capacity;
  private int size = 0;
  private int[] heap;
  
  public void set_array(int[] new_array) {
    this.heap = new_array;
    this.capacity = heap.length;
    this.size = heap.length;
  }

  public MinHeap(int capacity) {
    this.capacity = capacity;
    this.heap = new int[capacity];
  }

  private int getLeftChildIndex(int parentIndex) {
    return 2 * parentIndex + 1;
  }

  private int getRightChildIndex(int parentIndex) {
    return 2 * parentIndex + 2;
  }

  private int getParentIndex(int childIndex) {
    return (childIndex - 1) / 2;
  }

  private boolean hasLeftChild(int index) {
    return getLeftChildIndex(index) < size;
  }

  private boolean hasRightChild(int index) {
    return getRightChildIndex(index) < size;
  }

  private boolean hasParent(int index) {
    return getParentIndex(index) >= 0;
  }

  private int leftChild(int parentIndex) {
    return heap[getLeftChildIndex(parentIndex)];
  }

  private int rightChild(int parentIndex) {
    return heap[getRightChildIndex(parentIndex)];
  }

  private int parent(int childIndex) {
    return heap[getParentIndex(childIndex)];
  }

  private void swap(int index1, int index2) {
    int element = heap[index1];
    heap[index1] = heap[index2];
    heap[index2] = element;
  }

  /**
   * Insertion an item in the heap
   * (1) Attach the item to the last node
   * (2) Heapify it up, so it meets the 
   * requirement of a heap
   * Time complexity: O(log n)
   */
  public void add(int item) {
    ensureCapacity();
    heap[size] = item;
    size++;
    heapifyUp();
  }

  private void ensureCapacity() {
    if (size == capacity) {
      heap = Arrays.copyOf(heap, capacity * 2);
      capacity = capacity * 2;
    }
  }

  /** get the root element
   * Time Complexity : O(1)
   * @return
   */
  public int peek() {
    if (size == 0) {
      throw new NoSuchElementException();
    }
    return heap[0];
  }

  /**
   * Removal of the root node at the heap
   * (1) Remove and place last element at root
   * (2) Heapify down the root element, so it
   * meets the requirement of a heap
   * Time complexity: O(log n)
   */
  public void poll() {
    if (size == 0) {
      throw new NoSuchElementException();
    }

    int element = heap[0];

    heap[0] = heap[size - 1];
    size--;
    heapifyDown(0);
  }

  /** heapify down: "trickle" elements down, 
   * every time, swap it with the larger child, 
   * until the tree is heapified
   *  
   */
  private void heapifyDown(int index) {

    while (hasLeftChild(index)) {
      int smallerChildIndex = getLeftChildIndex(index);

      if (hasRightChild(index) && rightChild(index) < leftChild(index)) {
        smallerChildIndex = getRightChildIndex(index);
      }

      if (heap[index] > heap[smallerChildIndex]) {
        swap(index, smallerChildIndex);
      } else {
        break;
      }
      index = smallerChildIndex;
    }
  }

  /** heapify up: swap a leaf element up
   *  if it is larger than parent, until 
   *  the tree is heapified
   */
  private void heapifyUp() {
    int index = size - 1;

    while (hasParent(index) && parent(index) > heap[index]) {
      swap(getParentIndex(index), index);
      index = getParentIndex(index);
    }
  }
  
  /** heapify all: heapify the entire
   * tree (not just one path) backward
   * by finding all tuples (parent, left
   * child, right child), swap parent
   * with its larger child, and heapify
   * down the swapped element
   */
  private void heapifyAll() {
    
    int[] visited = new int[this.heap.length];
    
    for (int i = this.heap.length - 1; i >= 0; i --) {
      
      int parentIdx = this.getParentIndex(i);
      
      if (parentIdx == i)
        continue;
      
      if (visited[i] == 1) continue;
      
      int leftChildIdx = this.getLeftChildIndex(parentIdx);
      int rightChildIdx = this.getRightChildIndex(parentIdx);
      
      if (this.heap[leftChildIdx] < this.heap[rightChildIdx]) {
        swap(leftChildIdx, parentIdx);
        heapifyDown(leftChildIdx);
      }
      else {
        swap(rightChildIdx, parentIdx);
        heapifyDown(rightChildIdx);
      }
      
      visited[leftChildIdx] = 1;
      visited[rightChildIdx] = 1;
    }   
  }
  
  /** heap sort: (1) heapify the input array
   * (2) for i= length...0
   * remove the i-th smallest element, and
   * append it to the length - i-th position
   * @param array
   */
  private void heapSort(int[] array) {
    
    this.set_array(array);
    
    this.heapifyAll();
    
    for (int i = this.heap.length - 1; i >= 0; i --) {
      
      int next_element = this.peek();
      this.poll();
      this.heap[i] = next_element;
    }
    
    this.size = this.heap.length;
  }

  private void printHeap() {
    for (int i = 0; i < size; i++) {
      System.out.print(heap[i] + " ");
    }
  }

  public static void main(String[] args) {
    MinHeap minHeap = new MinHeap(14);
    minHeap.set_array(new int[] {6, 18, 8, 20, 28, 39, 29, 37, 26, 76, 32, 74});
    
   
    System.out.println(minHeap.toString());
    
    minHeap.add(89);
    System.out.println(minHeap.toString());
    
  }
  
  @Override
  public String toString() {
      StringBuilder sb = new StringBuilder();
      preOrderTraverse(0, 1, sb);
      return sb.toString();
  }


  /**
   * Perform a preorder traversal.
   * @param node The local root
   * @param depth The depth
   * @param sb The string buffer to save the output
   */
  private void preOrderTraverse(int node_idx, int depth,
          StringBuilder sb) {
      for (int i = 1; i < depth; i++) {
          sb.append("  ");
      }
      int left_child_idx = getLeftChildIndex(node_idx);
      int right_child_idx = getRightChildIndex(node_idx);
      
      if (node_idx >= this.size) {
          sb.append("null\n");
      } else {
          sb.append(this.heap[node_idx]);
          sb.append("\n");
          preOrderTraverse(left_child_idx, depth + 1, sb);
          preOrderTraverse(right_child_idx, depth + 1, sb);
      }
  }
}
