package Week_9;

import java.util.ArrayList;
import java.util.Stack;

public class BinarySearchTree<E extends Comparable<E>> extends BinaryTree<E> {
	
	protected class Node<E> {
		
		E value;
		
		Node<E> l_child;
		Node<E> r_child;
		
		Integer depth;
		
		protected Node(E value, Node<E> l_child, Node<E> r_child) {
			this.value = value;
			this.l_child = l_child;
			this.r_child = r_child;
		}
		
		protected void set_depth(int depth) {
			this.depth = depth;
		}
		
		protected int get_depth() {
			return this.depth;
		}
		
		private void set_value(E new_value) {
			this.value = new_value;
		}
	}
	
	/**Return value from the public add method.*/
	protected boolean addReturn;
	
	/**Return value from the public delete method.*/
	protected E deleteReturn;
	
	/** root of the BST */
	public Node<E> root;

	
	/** check whether a binary tree is a BST
	 * Define an upper bound and lower bound value for all nodes in the tree;
	 * Because
	 * (1) any node from the left subtree must be smaller than the root value;
	 * (2) any node from the right subtree must be larger than the root value;
	 * Each node will need to be smaller and larger than a list of root values along the path to the root;
	 * We can record the upper bound and the lower bound of values in this list;
	 * Then we only have to check whether a node's value is smaller than the upper bound and larger than the lower bound
	 * And update the upper bound and lower bound along the way
	 * @param root
	 * @param lower_bound
	 * @param upper_bound
	 * @return
	 */

    public boolean recursive_is_bst(Node<E> root, E lower_bound, E upper_bound) {
        if (root == null) return true;
        if (root.value.compareTo(lower_bound) <= 0 || root.value.compareTo(upper_bound) >= 0) return false;
        /**
         * After the line above, we know that root.value > lower_bound and root.value < upper_bound
         * (1) Left:
         *     Any node in the left subtree must be smaller than the upper_bound so far as well as root.value, 
         *     Therefore the upper bound for the left subtree is updated to min(upper_bound, root.value) = root.value
         *     Meanwhile, any node in the left subtree must be larger than lower_bound (not larger than root.value)
         *     Therefore the lower bound for the left subtree remain the same
         * (2) Right:
         *     Any node in the right subtree must be larger than the lower_bound so far as well as root.value, 
         *     Therefore the lower bound for the right subtree is updated to max(lower_bound, root.value) = root.value
         *     Meanwhile, any node in the right subtree must be smaller than upper_bound (not smaller than root.value)
         *     Therefore the upper bound for the left subtree remain the same
         */
        
        return recursive_is_bst(root.l_child, lower_bound, root.value) && recursive_is_bst(root.r_child, root.value, upper_bound);
    }
    
    /**
     * Check whether a tree is a BST
     * Step 1: In-Order traversal of the binary tree, store each element in a list
     * Step 2: Check whether the list monotonously increases
     * Pros and cons: inorder_isbst is easier to understand than recursive_is_bst, but it requires O(n) storage space
     * @param root
     * @return
     */
    public boolean inorder_isbst(Node<E> root) {
        if (root == null) return true;
        if (root.l_child == null && root.r_child == null) return true;
        
        ArrayList<E> value_list = new ArrayList<E>();
        
        inOrderTraversal(root, value_list);
        
        for (int i = 1; i < value_list.size(); i++) {
            if (value_list.get(i).compareTo(value_list.get(i - 1)) <= 0) return false;
        }
        return true;
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
    
    /** binary tree in-order traversal
     * @param root
     * @param value_list
     */
    public void inOrderTraversal(Node<E> root, ArrayList<E> value_list) {
        if (root == null) return;
        inOrderTraversal(root.l_child, value_list);
        value_list.add(root.value);
        inOrderTraversal(root.r_child, value_list);
    }
    
    /**
     * search for a target in a valid BST
     * @param root
     * @param target
     * @return
     */
	public Node<E> recursive_search(Node<E> root, E target) {
		
		if (root == null)
			return null;
		
		if (root.value.compareTo(target) == 0) {
			return root;
		}
		else if (root.value.compareTo(target) < 0) {
			return recursive_search(root.r_child, target);
		}
		else {
			return recursive_search(root.l_child, target);
		}
	}
	
	public Node<Integer> build_tree_int() {
		Node<Integer> zero = new Node<Integer>(0, null, null);
		Node<Integer> two = new Node<Integer>(2, null, null);
		
		Node<Integer> four = new Node<Integer>(4, null, null);
		Node<Integer> six = new Node<Integer>(6, null, null);
		
		Node<Integer> five = new Node<Integer>(5, null, six);
		Node<Integer> three = new Node<Integer>(3, two, five);
		
		Node<Integer> one = new Node<Integer>(1, zero, three);
		
		return one;
	}
	
    /** testing check BST
     */
	public void test_is_bst() {
		BinarySearchTree bt = new BinarySearchTree();
		Node root = bt.build_tree_int();
		
		boolean is_bst = bt.recursive_is_bst(root, Integer.MIN_VALUE, Integer.MAX_VALUE);
		
		System.out.println(is_bst);
	}
	
    /** testing BST search
     */
	public void test_search() {
		BinarySearchTree bt = new BinarySearchTree();
		Node<Integer> root = bt.build_tree_int();
		
		Node<Integer> node = bt.recursive_search(root, 2);
		
		System.out.println(node.value);
	}
	
    /** testing BST node removal
     */
	public void test_bst_removal() {
		BinarySearchTree bt = new BinarySearchTree();
		Node<E> new_root = bt.build_tree_int();
		
		String tree_str_before = bt.toString(new_root);
		//System.out.println(tree_str_before);
		
		this.root = new_root;
		this.root = bt.deleteNode(this.root, (Integer)2);
		
		String tree_str_after = bt.toString(this.root);
		System.out.println(tree_str_after);
	}
	
    /** testing BST node insertion
     */
	public void test_insert_BST() {
		BinarySearchTree bt = new BinarySearchTree();
		Node<E> new_root = bt.build_tree_int();
		
		String tree_str_before = bt.toString(new_root);
		//System.out.println(tree_str_before);
		
		this.root = new_root;
		this.root = bt.insertNode(this.root, (Integer)7);
		
		String tree_str_after = bt.toString(this.root);
		System.out.println(tree_str_after);
	}
	
	public void test_insert_delete_BST2() {
		BinarySearchTree bt = new BinarySearchTree();
		
		Node<Integer> root = new Node<Integer>(9, null, null);
		
		root = bt.insertNode(root, (Integer)5);
		root = bt.insertNode(root, (Integer)10);
		root = bt.insertNode(root, (Integer)0);
		root = bt.insertNode(root, (Integer)6);
		root = bt.insertNode(root, (Integer)11);
		root = bt.insertNode(root, (Integer) (-1));
		root = bt.insertNode(root, (Integer)1);
		root = bt.insertNode(root, (Integer)2);
		
        /* The constructed AVL Tree would be  
        9  
        / \  
        5 10  
        /\ \  
        0 6 11  
        /\     
       -1 1
           \
            2    
        */
		
		root = bt.deleteNode(root, (Integer) (0));
		
		System.out.println("Preorder traversal of constructed tree is : ");
		System.out.println(bt.toString(root));
	}
	
    public void preOrderTraverseFlat(Node<Integer> node)  
    {  
        if (node != null)  
        {  
            System.out.print(node.value + " ");  
            preOrderTraverseFlat(node.l_child);  
            preOrderTraverseFlat(node.r_child);  
        }  
    }  
	
	public String toString(Node<E> root) {
		  StringBuilder sb = new StringBuilder();
		  preOrderTraverse(root, 1, sb);
		  return sb.toString();
	}
	
	/** recursively inserting a node into BST
	 * 
	 * @param root
	 * @param target
	 * @return
	 */

    public Node<E> insertNode(Node<E> root, E target) {
        
        if(root == null) {
        	addReturn = true;
            return new Node(target, null, null);
        }
        
         if(target.compareTo(root.value) < 0) {
        	addReturn = false;
            root.l_child = insertNode(root.l_child, target);
        } else {
            root.r_child = insertNode(root.r_child, target);
        }
        return root;
    }
    
    /** recursively removing a node from BST
     * 
     * @param root
     * @param target
     * @return
     */    
    private Node<E> deleteNode(Node<E> root, E target) {
        if (root == null)
          return null;
        
        if (target.compareTo(root.value) < 0)  
        	root.l_child = deleteNode(root.l_child, target);
        
        // If the key to be deleted is greater than the  
        // root's key, then it lies in right subtree  
        else if (target.compareTo(root.value) > 0)  
        	root.r_child = deleteNode(root.r_child, target);
        	
        // if key is same as root's key, then this is the node  
        // to be deleted 
        else {
            if (root.r_child == null) {
                root = root.l_child;
            }
            else {
            	// node with two children: Get the inorder  
                // successor (smallest in the right subtree)
                Node<E> right = minValueNode(root.r_child);
                
                // Copy the inorder successor's data to this node 
                root.set_value(right.value);
                
             // Delete the inorder successor  
                root.r_child = deleteNode(root.r_child, right.value);
            }
        }

        return root;
    }
    
    Node<E> minValueNode(Node<E> node)  
    {  
    	Node current = node;  
  
        /* loop down to find the leftmost leaf */
        while (current.l_child != null)  
        current = current.l_child;  
  
        return current;  
    } 
	
	public static void main(String[] args) {
		BinarySearchTree<Integer> bst = new BinarySearchTree<Integer>();
		
		bst.test_insert_delete_BST2();
	}
}

