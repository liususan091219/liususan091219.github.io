public class PairLinkedList {
	
	private static class Node {
		  private Integer data;
		  private Node next;
		  /** Creates a new node with a null next field
		      @param dataItem  The data stored
		  */
		  
		  private Node(int dataItem) {
		    data = dataItem;
		    next = null;
		  }	 
	}

	private static class Pair {
		  private Integer data;
		  private Integer copy_count;
		  private Pair next;
		  /** Creates a new pair with a null next field
		      @param dataItem  The data stored
		  */
		  
		  private Pair(Integer dataItem) {
		    data = dataItem;
		    next = null;
		  }	 
		  
		  /**
		   * set the number of copies as copy
		   * @param copy
		   */
		  private void set_copy(Integer copy) {
			  copy_count = copy;
		  }
	}
	
	Pair head;
	
	/**
	 * return the string of the linked list
	 */
	public String toString() {
	    StringBuilder sb = new StringBuilder("[");
	    Pair p = head;
	    if (p != null) {
	        while (p.next != null) {
	            sb.append(p.data.toString());
	            sb.append(",");
	            sb.append(p.copy_count);
	            sb.append(" ==> ");
	            p = p.next;
	        }
	        sb.append(p.data.toString());
	        sb.append(",");
            sb.append(p.copy_count);
	    }
	    sb.append("]");
	    return sb.toString();
	}
	
	public static void main(String[] args) {
		
	    Node n1 = new Node(3);
	    Node n2 = new Node(3);
	    Node n3 = new Node(2);
	    Node n4 = new Node(3);
	    Node n5 = new Node(2);
	    Node n6 = new Node(3);
	    Node n7 = new Node(1);

	    n1.next = n2;
	    n2.next = n3;
	    n3.next = n4;
	    n4.next = n5;
	    n5.next = n6;
	    n6.next = n7;
	    
	    PairLinkedList pll = new PairLinkedList();
	    
	    System.out.println(pll.toString());
	}
}
