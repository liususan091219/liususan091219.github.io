package junit;

import java.util.ArrayList;

class MyLinkedList {
	 
    public Node head;
    
    public static class PairNode {
    	Node head;
    	Node tail;
    	
    	public PairNode(Node head, Node tail) {
    		this.head = head;
    		this.tail = tail;
    	}
    }
 
    public static class Node {
 
        int data;
        Node next;
        
        public Node() {
        	
        }
 
        public Node(int d)
        {
            data = d;
            next = null;
        }
    }
    
    public MyLinkedList(Node newhead) {
    	this.head = newhead;
    }
    
    /**
    * @return a boolean indicating whether all the
    elements in the list are non-null
    */
    public MyLinkedList clone2() {
      if (this.head != null) {
      Node previous = new Node(head.data);
      Node head_2 = previous;
      
      Node node = this.head;
      while (node.next != null) {
        node = node.next;
        Node node_2 = new Node(node.data);
        previous.next = node_2;
        previous = node_2;
      }
      previous.next = null;
      return new MyLinkedList(head_2);
    }
      else {
      return null;
    }
    }
    
    /**
    * returns a new list in which n copies of the
    original list have been juxtaposed
    * @param n
    */
    public MyLinkedList repeatLN(int n){
       MyLinkedList sll_clone = this.clone2();
       MyLinkedList sll_clone2 = sll_clone.clone2();
       for (int i = 0; i < n - 1; i ++)
    	   sll_clone = sll_clone.append(sll_clone2);
       return sll_clone;
    }
 
    /* Function to reverse the linked list */
    public MyLinkedList reverse()
    {
        Node prev = null;
        MyLinkedList cloned_list = this.clone2();
        Node current = cloned_list.head;
        Node next = null;
        while (current != null) {
            next = current.next;
            current.next = prev;
            prev = current;
            current = next;
        }
        //adding this.head will cause infinite loop
        //this.head = prev;
        return new MyLinkedList(prev);
    }
 
    // prints content of double linked list
    void printList(Node node)
    {
        while (node != null) {
            System.out.print(node.data + " ");
            node = node.next;
        }
    }
    
    public MyLinkedList append(MyLinkedList l2){
    	MyLinkedList cloned_list2 = this.clone2();
    	if (cloned_list2.head != null) {
    	Node node = cloned_list2.head;
    	while (node.next != null) {
    	node = node.next;
    	}
    	node.next = l2.head;
    	return new MyLinkedList(cloned_list2.head);
    	}
    	else
    		return null;
    	}
    
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("[");
        Node p = head;
        if (p != null) {
            while (p.next != null) {
                sb.append(p.data);
                sb.append(" ==> ");
                p = p.next;
            }
            sb.append(p.data);
        }
        sb.append("]");
        return sb.toString();
    }
    
    public PairNode sub_copy(Node node, int n) {
    	Node head = node;
    	for (int j = 0; j < n - 1; j ++) {
    	Node copy_node = new Node(node.data);
    	  node.next = copy_node;
    	  node = copy_node;
    	}
    	return new PairNode(head, node);
    }
    
    /**
    * repeats each element in the list n times
    * @param n
    */
    public MyLinkedList stutterNL(int n){
      if (this.head != null) {
    	  
      Node node = this.head;
      Node node_next = node.next;
      
      PairNode head_tail = this.sub_copy(node, n);
      Node old_head = head_tail.head;
      Node old_tail = head_tail.tail;
      
      while (node_next != null) {
        node = node_next;
        node_next = node.next;
        
        head_tail = this.sub_copy(node, n);
        
        Node new_head = head_tail.head;
        Node new_tail = head_tail.tail;
        
        old_tail.next = new_head;
        
        old_tail = new_tail;
      }
      return new MyLinkedList(old_head);
    }
      else
    	  return null;
    }
    
    public MyLinkedList zipL(MyLinkedList l2){
    	if (this.head != null) {
    	Node node = this.head;
    	Node new_head = node;
    	Node node_2 = l2.head;
    	Node node_next = node.next;
    	Node node_next_2 = node_2.next;
    	while (node_next != null) {
    	  node.next = node_2;
    	  node_2.next = node_next;
    	  
    	  node = node_next;
    	  node_2 = node_next_2;
    	  
    	  node_next = node.next;
    	  node_next_2 = node_2.next;
    	}
    	return new MyLinkedList(new_head);
    	}
    	return null;
    }
    
    public MyLinkedList removeAdjacentDuplicates() {
    	if (this.head != null) {
    	Node node = this.head;
    	Node new_head = node;
    	Node current_node = node;
    	
    	int prev_Data = node.data;
    	   while (node.next != null) {
    	     node = node.next;
	    	 if (node.data != prev_Data) {
	    	   current_node.next = node;
	    	   current_node = node;
	    	 }
    	     prev_Data = node.data;
    	}
    	current_node.next = null;
    	return new MyLinkedList(new_head);
    	}
    	return null;
    	}
    
    public MyLinkedList Reverse(int left, int right) {

        Node dummy = new Node();
        Node pre = dummy, fast = dummy;
        dummy.next = head;
        for(int i=0; i<left; i++) pre = pre.next;
        for(int i=0; i<=right + 1; i++) fast = fast.next;
        
        Node slow = pre.next;
        
        int len = right-left+1;
        Node next = null;
        while(len-- > 0) {
            next = slow.next;
            slow.next = fast;
            fast = slow;
            slow = next;
        }

        pre.next = fast;
        return new MyLinkedList(dummy.next);
        
    }
    
    public Node getIntersectionNode(Node head1, Node head2) {
    		if (head1 == null || head2 == null)
    			return null;
    		Node node1 = head1;
    		Node node2 = head2;
    		int len1 = 0;
    		int len2 = 0;
    		while (node1 != null) {
    			node1 = node1.next;
    			len1 ++;
    		}
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
 
    // Driver Code
    public static void main(String[] args)
    {
        MyLinkedList list = new MyLinkedList(new Node(85));
        Node node2 = new Node(15);
        Node node3 = new Node(4);
        Node node4 = new Node(20);
        list.head.next = node2;
        list.head.next.next = node3;
        list.head.next.next.next = node4;
        
        MyLinkedList list2 = new MyLinkedList(new Node(55));
        list2.head.next = node2;
        list2.head.next.next = node3;
        list2.head.next.next.next = node4;
        
        System.out.println("the stuttered list:");
        System.out.println(list.getIntersectionNode(list.head, list2.head).data);
         
        //System.out.println(list.zipL(cloned_list).toString());
    }
}
