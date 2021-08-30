package Week_9;

import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

import org.junit.Assert;

public class BinaryTree<E> {
	
	protected class Node<E> {
		
		E value;
		
		Node<E> l_child;
		Node<E> r_child;
		
		int depth;
		
		private Node(E value, Node<E> l_child, Node<E> r_child) {
			this.value = value;
			this.l_child = l_child;
			this.r_child = r_child;
		}
		
		private void set_depth(int depth) {
			this.depth = depth;
		}
		
		private int get_depth() {
			return this.depth;
		}
	}
	
	public Node<String> build_tree_str() {
		Node<String> men = new Node<String>("men", null, null);
		Node<String> women = new Node<String>("women", null, null);
		
		Node<String> boys = new Node<String>("boys", null, null);
		Node<String> girls = new Node<String>("girls", null, null);
		
		Node<String> adults = new Node<String>("adults", men, women);
		Node<String> kids = new Node<String>("kids", boys, girls);
		
		Node<String> human = new Node<String>("human", adults, kids);
		
		return human;
	}
	
	/** get the height of a tree
	 * @param root
	 * @return
	 */
	public int recursive_get_height(Node<E> root) {
		
		if (root.l_child == null && root.r_child == null)
			return 1;
		
		int left_height = 0;
		int right_height = 0;
		
		if (root.l_child != null)
			left_height = recursive_get_height(root.l_child);
		
		if (root.r_child != null)
			right_height = recursive_get_height(root.r_child);
		
		return 1 + Math.max(left_height, right_height);
	}
	
	/** count how many nodes in a tree
	 * @param root
	 * @return
	 */
	public int recursive_count_nodes(Node<E> root) {
		
		if (root.l_child == null && root.r_child == null)
			return 1;
		
		int left_count = 0;
		int right_count = 0;
		
		if (root.l_child != null)
			left_count = recursive_count_nodes(root.l_child);
		
		if (root.r_child != null)
			right_count = recursive_count_nodes(root.r_child);
		
		return 1 + left_count + right_count;
	}
	
	public String toString(Node<E> root) {
		  StringBuilder sb = new StringBuilder();
		  preOrderTraverse_iter(root, sb);
		  return sb.toString();
	}
	
	/** preOrder traversal using recursion
	 * 
	 * @param root
	 * @param depth
	 * @param sb
	 */
	private void preOrderTraverse(Node<E> root, int depth, StringBuilder sb) {
		  for (int i = 1; i < depth; i++) {
		    sb.append("  ");
		  }
		  if (root == null) {
		    sb.append("null\n");
		  } else {
		    sb.append(root.value);
		    sb.append("\n");
		    preOrderTraverse(root.l_child, depth + 1, sb);
		    preOrderTraverse(root.r_child, depth + 1, sb);
		  }
	}
	
	/** preOrder traversal using stack
	 * Every time, pops the current node, and pushes its right child, then left child
	 * @param root
	 * @param depth
	 * @param sb
	 */
    public void preOrderTraverse_iter(Node<E> root, StringBuilder sb) {
        root.set_depth(1);
        Stack<Node<E>> stack = new Stack<Node<E>>();
        stack.push(root);
        
        while(!stack.isEmpty()){
            Node<E> temp = stack.pop();
            int this_depth = temp.get_depth();
            
            for (int i = 1; i < this_depth; i++) {
            	sb.append("  ");
            }
            if (temp == null)
            	sb.append("null\n");
            else {
            	sb.append(temp.value);
            	sb.append("\n");
            }
            
            if(temp.r_child != null){
            	temp.r_child.set_depth(this_depth + 1);
                stack.push(temp.r_child);
            }
            if(temp.l_child != null){
            	temp.l_child.set_depth(this_depth + 1);
                stack.push(temp.l_child);
            }
        }
    }
	
    /** testing recursive_get_height
     */
	public void test_get_height() {
		BinaryTree bt = new BinaryTree();
		Node<String> root = bt.build_tree_str();
		
		int height = bt.recursive_get_height(root);		
		System.out.println(height);
	}
	
    /** testing preOrderTraverse
     */
	public void test_toString() {
		BinaryTree bt = new BinaryTree();
		Node<String> root = bt.build_tree_str();
		
		String root_str = bt.toString(root);
		
		System.out.println(root_str);
	}
	
    /** testing recursive_count_nodes
     */
	public void test_count_nodes() {
		BinaryTree bt = new BinaryTree();
		Node<String> root = bt.build_tree_str();
		
		int node_count = bt.recursive_count_nodes(root);
		System.out.println(node_count);
	}
	
	public static void main(String[] args) {
		
		BinaryTree bt = new BinaryTree();
		bt.test_get_height();
		//bt.test_toString();
	}
}

