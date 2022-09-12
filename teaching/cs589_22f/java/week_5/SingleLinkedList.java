package Week_5;

import java.util.ArrayList;

public class SingleLinkedList<E> {
	
	private static class Node<E> {
		  private E data;
		  private Node<E> next;
		  /** Creates a new node with a null next field
		      @param dataItem  The data stored
		  */
		  
		  private Node(E dataItem) {
		    data = dataItem;
		    next = null;
		  }	 
	}
	
	Node<E> head;
	
	public SingleLinkedList(Node<E> head) {
		this.head = head;
	}
	
	/**
	 * return the string of the linked list
	 */
	public String toString() {
	    StringBuilder sb = new StringBuilder("[");
	    Node<E> p = head;
	    if (p != null) {
	        while (p.next != null) {
	            sb.append(p.data.toString());
	            sb.append(" ==> ");
	            p = p.next;
	        }
	        sb.append(p.data.toString());
	    }
	    sb.append("]");
	    return sb.toString();
	}
	
	/**
	 * 
	 * @return a boolean indicating whether all the elements in the list are non-null
	 */
	public SingleLinkedList<E> clone() {
		if (this.head != null) {
			Node<E> previous = new Node<E>(head.data);
			Node<E> head_2 = previous;
			Node<E> node = this.head;
			while (node.next != null) {
				node = node.next;
				Node<E> node_2 = new Node<E>(node.data);
				previous.next = node_2;
				previous = node_2;
			}
			return new SingleLinkedList<E>(head_2);
		}
		else {
			return null;
		}
	}
	
	/**
	 * 
	 * @return appends the two lists
	 */
	public void append(SingleLinkedList<E> l2){
		if (this.head != null) {
			Node<E> node = this.head;
			while (node.next != null) {
				node = node.next;
			}
			node.next = l2.head;
		}
		else {
			this.head = l2.head;
		}
	}
	
	/**
	 * reverse the linked list
	 */
	public Node<E> reverse() {		
		if (this.head != null) {
			Node<E> new_current_head = this.head;
			Node<E> current = new_current_head.next;
			new_current_head.next = null;
			while (current != null) {
				Node<E> tmp = current.next;
				current.next = new_current_head;
				new_current_head = current;
				current = tmp;
			}
			return new_current_head;
		}
		return null;
	}
	
	/**
	 * reverse the linked list from m to n-th position
	 * @throws Exception 
	 */
	public Node<E> reverse(int m, int n) throws Exception {	
		if (m < 0)
			throw new Exception("illegal input");
		if (this.head != null) {
			Node<E> new_current_head = this.head;
			Node<E> current = this.head;
			for (int i = 0; i < m - 1; i ++) {
				current = current.next;
			}
			Node<E> last_node = null;
			Node<E> prev_node = null;
			if (m > 0) {
				last_node = current;
				current = current.next;
				prev_node = current;
			}
			if (current == null) {
				return new_current_head;
			}
			else {
				Node<E> next_node = current.next;
				if (next_node == null) {
					return new_current_head;
				}
				else {
					current.next = null;
					Node<E> tmp = next_node;
					for (int i = m; i < n - 1; i ++) {
						tmp = next_node.next;
						next_node.next = current;
						current = next_node;
						next_node = tmp;
						if (tmp == null) {
							break;
						}
					}
					if (m > 0) {
						last_node.next = current;
						prev_node.next = tmp;
						return new_current_head;
					}
					else {
						new_current_head.next = tmp;
						return current;
					}
				}
			}
		}
		else
			return null;
	}
	
	/**
	 * returns a new list in which n copies of the original list have been juxtaposed
	 * @param n
	 */
	public void repeatLN(int n){
		SingleLinkedList<E> sll_clone = this.clone();
		for (int i = 0; i < n - 1; i ++)
			this.append(sll_clone);
	}
	
	/** 
	 * return a linked linked consisting of node copied n times
	 * @param node
	 * @param n
	 * @return the head and tail of the list
	 */
	public ArrayList<Node<E>> sub_copy(Node<E> node, int n) {
		Node<E> head = node;
		for (int j = 0; j < n - 1; j ++) {
			Node<E> copy_node = new Node<E>(node.data);
			node.next = copy_node;
			node = copy_node;
		}
		ArrayList<Node<E>> ret_array = new ArrayList<Node<E>>();
		ret_array.add(head);
		ret_array.add(node);
		return ret_array;
	}
	
	/**
	 * removing the adjacent duplicate items
	 */
	public void removeAdjacentDuplicates() {
		if (this.head != null) {
			Node<E> node = this.head;
			Node<E> new_head = node;
			Node<E> current_node = node;
			E prev_Data = node.data;
			while (node.next != null) {
				node = node.next;
				if (node.data.equals(prev_Data) == false) {
					current_node.next = node;
					current_node = node;
				}
				prev_Data = node.data;
			}
			this.head = new_head;
		}
	}
	
	/**
	 * Provide a solution in which a new list is constructed
	 * @param l2
	 */
	public void zipL(SingleLinkedList<E> l2){
		if (this.head != null) {
			Node<E> node = this.head;
			Node<E> new_head = node;
			Node<E> node_2 = l2.head;
			Node<E> node_next = node.next;
			Node<E> node_next_2 = node_2.next;
			
			while (node_next != null) {
				node.next = node_2;
				node_2.next = node_next;
				
				node = node_next;
				node_2 = node_next_2;
				
				node_next = node.next;
				node_next_2 = node_2.next;
			}
			
			//node.next = node_2;
			this.head = new_head;
		}
	}
	
	/**
	 * repeats each element in the list n times
	 * @param n
	 */
	public void stutterNL(int n){
		if (this.head != null) {
			Node<E> node = this.head;
			Node<E> node_next = node.next;
			ArrayList<Node<E>> sub_list = this.sub_copy(node, n);
			Node<E> all_head = sub_list.get(0);
			Node<E> new_tail = sub_list.get(1);
			while (node_next != null) {
				node = node_next;
				node_next = node.next;
				sub_list = this.sub_copy(node, n);
				Node<E> new_head = sub_list.get(0);
				new_tail.next = new_head;
				new_tail = sub_list.get(1);
			}
			this.head = all_head;
		}
	}
	
	/**
	 * get the intersection node between list starting with head1 and head2
	 * @param head1
	 * @param head2
	 * @return
	 */
	public Node<E> getIntersectionNode(Node<E> head1, Node<E> head2) {
		
		if (head1 == null || head2 == null)
			return null;
		
		Node<E> node1 = head1;
		Node<E> node2 = head2;
		
		int len1 = 0;
		while (node1 != null) {
			node1 = node1.next;
			len1 ++;
		}
		
		int len2 = 0;
		while (node2 != null) {
			node2 = node2.next;
			len2 ++;
		}
		
		node1 = head1;
		node2 = head2;
		
		if (len1 > len2) {
			// shift node1 for len1 - len2 times;
			int steps = len1 - len2;
			
			for (int i = 0; i < steps; i ++)
				node1 = node1.next;
		}
		else if (len2 > len1){
			int steps = len2 - len1;
			
			for (int i = 0; i < steps; i ++)
				node2 = node2.next;
		}
		
		// now make sync move for node 1 and node2 
		
		while (node1 != null) {
			if (node1.equals(node2) == true)
				return node1;
			node1 = node1.next;
			node2 = node2.next;
		}
		
		return null;
	}
	
	public static void test_reverse() throws Exception {
		Node<String> tom = new Node<String>("tom");
		Node<String> bill = new Node<String>("bill");
		Node<String> harry = new Node<String>("harry");
		Node<String> sam = new Node<String>("sam");
		Node<String> mary = new Node<String>("mary");

		tom.next = bill;
		bill.next = harry;
		harry.next = sam;
		sam.next = mary;
		
		SingleLinkedList<String> sll = new SingleLinkedList<String>(tom);
		
		sll.reverse(1, 7);
		
		System.out.println(sll.toString());
	}
	
	public static void test_intersection() {
		Node<String> tom = new Node<String>("tom");
		Node<String> bill = new Node<String>("bill");
		Node<String> harry = new Node<String>("harry");
		Node<String> sam = new Node<String>("sam");
		Node<String> mary = new Node<String>("mary");
		
		tom.next = bill;
		bill.next = harry;
		harry.next = sam;
		sam.next = mary;
		
		SingleLinkedList<String> sll = new SingleLinkedList<String>(tom);
		
		Node<String> amy = new Node<String>("amy");
		Node<String> matt = new Node<String>("matt");
		amy.next = matt;
		matt.next = mary;
		
		Node<String> intersection = sll.getIntersectionNode(tom, amy);
		
		System.out.println(sll.toString());
	}
	
	public static void test_linkedlist() {
		Node<String> tom = new Node<String>("tom");
		Node<String> bill = new Node<String>("bill");
		Node<String> harry = new Node<String>("harry");
		Node<String> sam = new Node<String>("sam");
		Node<String> mary = new Node<String>("mary");

		tom.next = bill;
		bill.next = harry;
		harry.next = sam;
		sam.next = mary;
		
		SingleLinkedList<String> sll = new SingleLinkedList<String>(tom);
		
		//SingleLinkedList<String> sll_clone = sll.clone();
		
		//sll.reverse();
		//sll.append(sll_clone);
		//sll.stutterNL(3);
		//sll.removeAdjacentDuplicates();
		//sll.zipL(sll_clone);
		
		System.out.println(sll.toString());
	}
	
	public static void main(String[] args) throws Exception {
		
		SingleLinkedList<String> sll = new SingleLinkedList<String>(null);
		
		//sll.test_linkedlist();
		sll.test_reverse();
		//sll.test_intersection();
		
	}
}

