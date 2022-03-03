package testpackage;

import java.util.ArrayList;
import java.util.Stack;

public class SingleLinkedList<E> {
	//head reference
	private Node<E> headNode = null;
	
	//get headNode
	public Node<E> getHeadNode() {
		return headNode;
	}
	
	//set headNode
	public void setHeadNode(Node<E> node) {
		headNode = node;
	}
	
	/**
	 * Determines whether the recipient list has cycles.
	 * @return boolean(true | false) -> If cycle return true else return false
	 */
	public boolean hasCycle() {
        Node<E> slow = headNode;
        Node<E> fast = headNode;
        int bool = 0;
        while (slow != null && fast != null) {
            slow = slow.getNext();
            fast = fast.getNext().getNext();
            if (slow == fast ) {
                bool = 1;
                break;
            } 
        }
        if (bool == 1) {
            return true;
        }
        else {
            return false;
        }
	}
	
	public static void main(String[] args) {
		//TestCase 1
		//list contains three nodes 1, 2, 3 and they are linked as below
		//1 -> 2 -> 3 -> 1
		//Answer: List has a cycle, because 3 is pointing back to 1 
		SingleLinkedList<Integer> list = new SingleLinkedList<>();
		Node<Integer> node1 = new Node<Integer>(1);
		Node<Integer> node2 = new Node<Integer>(2);
		Node<Integer> node3 = new Node<Integer>(3);
		list.headNode = node1;
		node1.setNext(node2); 
		node2.setNext(node3);
		node3.setNext(node1);
		
		//Validate if list contains cycle
		if(list.hasCycle()) {
			System.out.println("List contains cycle");
		} else {
			System.out.println("List doesn't contain cycle");
		}
		
		//TestCase 2
		//list2 contains two nodes 10, 20 and they are linked as below
		//10 -> 20
		//Answer: list2 doesn't contain a cycle
		SingleLinkedList<Integer> list2 = new SingleLinkedList<>();
		Node<Integer> node4 = new Node<Integer>(10);
		Node<Integer> node5 = new Node<Integer>(20);
		list2.headNode = node4;
		node4.setNext(node5);
		
		//Validate if list contains cycle
		if(list2.hasCycle()) {
			System.out.println("List2 contains cycle");
		} else {
			System.out.println("List2 doesn't contain cycle");
		}
		
	}
	
	public boolean isPalindrome(){
		Node node = this.headNode;
		Stack<E> s = new Stack<E>();
		while(node!= null){
			s.push((E) node.getData());
			node = node.getNext();
		}
		node = this.headNode;
		while(node!= null){
			E this_char = s.pop();
			if(node.getData() != this_char)
			return false;
			node = node.getNext();
			}
		return true;
		}
	
	public static void test_palindrome() {
		SingleLinkedList<String> list = new SingleLinkedList<>();
		Node<String> node1 = new Node<String>("k");
		Node<String> node2 = new Node<String>("s");
		Node<String> node3 = new Node<String>("y");
		Node<String> node4 = new Node<String>("a");
		Node<String> node5 = new Node<String>("k");
		list.headNode = node1;
		node1.setNext(node2); 
		node2.setNext(node3);
		node3.setNext(node4);
		node4.setNext(node5);
		
		System.out.println(list.isPalindrome());
	}
}
