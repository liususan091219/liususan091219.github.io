package testpackage;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;

/**
 * Class for a binary tree that stores type E objects.
 * @author Koffman and Wolfgang
 **/
public class BinaryTree<E> implements Serializable {

    /*<listing chapter="6" number="1">*/
    /** Class to encapsulate a tree node. */
    protected static class Node<E> implements Serializable {
        // Data Fields

        /** The information stored in this node. */
        public E data;
        /** Reference to the left child. */
        public Node<E> left;
        /** Reference to the right child. */
        public Node<E> right;

        // Constructors
        /**
         * Construct a node with given data and no children.
         * @param data The data to store in this node
         */
        public Node(E data) {
            this.data = data;
            left = null;
            right = null;
        }

        // Methods
        /**
         * Returns a string representation of the node.
         * @return A string representation of the data fields
         */
        @Override
        public String toString() {
            return data.toString();
        }
        
        public Node(E data, Node<E> left, Node<E> right) {
        	this.data = data;
        	this.left = left;
        	this.right = right;
        }
    }
    /*</listing>*/
    // Data Field
    /** The root of the binary tree */
    protected Node<E> root;

    /** Construct an empty BinaryTree */
    public BinaryTree() {
        root = null;
    }

    /**
     * Construct a BinaryTree with a specified root.
     * Should only be used by subclasses.
     * @param root The node that is the root of the tree.
     */
    protected BinaryTree(Node<E> root) {
        this.root = root;
    }

    /**
     * Constructs a new binary tree with data in its root,leftTree
     * as its left subtree and rightTree as its right subtree.
     */
    public BinaryTree(E data, BinaryTree<E> leftTree,
            BinaryTree<E> rightTree) {
        root = new Node<E>(data);
        if (leftTree != null) {
            root.left = leftTree.root;
        } else {
            root.left = null;
        }
        if (rightTree != null) {
            root.right = rightTree.root;
        } else {
            root.right = null;
        }
    }

    /**
     * Return the left subtree.
     * @return The left subtree or null if either the root or
     * the left subtree is null
     */
    public BinaryTree<E> getLeftSubtree() {
        if (root != null && root.left != null) {
            return new BinaryTree<E>(root.left);
        } else {
            return null;
        }
    }

    /**
     * Return the right sub-tree
     * @return the right sub-tree or
     *         null if either the root or the
     *         right subtree is null.
     */
    public BinaryTree<E> getRightSubtree() {
        if (root != null && root.right != null) {
            return new BinaryTree<E>(root.right);
        } else {
            return null;
        }
    }

    /**
     * Return the data field of the root
     * @return the data field of the root
     *         or null if the root is null
     */
    public E getData() {
        if (root != null) {
            return root.data;
        } else {
            return null;
        }
    }

    /**
     * Determine whether this tree is a leaf.
     * @return true if the root has no children
     */
    public boolean isLeaf() {
        return (root == null || (root.left == null && root.right == null));
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        preOrderTraverse(root, 1, sb);
        return sb.toString();
    }

    /**
     * Perform a preorder traversal.
     * @param node The local root
     * @param depth The depth
     * @param sb The string buffer to save the output
     */
    private void preOrderTraverse(Node<E> node, int depth,
            StringBuilder sb) {
        for (int i = 1; i < depth; i++) {
            sb.append("  ");
        }
        if (node == null) {
            sb.append("null\n");
        } else {
            sb.append(node.toString());
            sb.append("\n");
            preOrderTraverse(node.left, depth + 1, sb);
            preOrderTraverse(node.right, depth + 1, sb);
        }
    }

    
    public void inOrderTraversal(Node<E> node, ArrayList<E> value_list) {
    	if (node == null) {
    		return;
    	}
    	inOrderTraversal(node.left, value_list);
    	value_list.add(node.data);
    	inOrderTraversal(node.right, value_list);
    }
    
    /*<listing chapter="6" number="2">*/
    /**
     * Method to read a binary tree.
     * @pre The input consists of a preorder traversal
     *      of the binary tree. The line "null" indicates a null tree.
     * @param bR The input file
     * @return The binary tree
     * @throws IOException If there is an input error
     */
    public static BinaryTree<String> readBinaryTree(BufferedReader bR)
            throws IOException {
        // Read a line and trim leading and trailing spaces.
        String data = bR.readLine().trim();
        if (data.equals("null")) {
            return null;
        } else {
            BinaryTree<String> leftTree = readBinaryTree(bR);
            BinaryTree<String> rightTree = readBinaryTree(bR);
            return new BinaryTree<String>(data, leftTree, rightTree);
        }
    }
    /*</listing>*/

    /*<exercise chapter="6" section="3" type="programming" number="1">*/
    /**
     * Method to return the preorder traversal of the binary tree
     * as a sequence of strings each separated by a space.
     * @return A preorder traversal as a string
     */
    public String preorderToString() {
        StringBuilder stb = new StringBuilder();
        preorderToString(stb, root);
        return stb.toString();
    }

    private void preorderToString(StringBuilder stb, Node<E> root) {
        stb.append(root);
        if (root.left != null) {
            stb.append(" ");
            preorderToString(stb, root.left);
        }
        if (root.right != null) {
            stb.append(" ");
            preorderToString(stb, root.right);
        }
    }
    /*</exercise>*/

    /*<exercise chapter="6" section="3" type="programming" number="2">*/
    /**
     * Method to return the postorder traversal of the binary tree
     * as a sequence of strings each separated by a space.
     * @return A postorder traversal as a string
     */
    public String postorderToString() {
        StringBuilder stb = new StringBuilder();
        postorderToString(stb, root);
        return stb.toString();
    }

    private void postorderToString(StringBuilder stb, Node<E> root) {
        if (root.left != null) {
            postorderToString(stb, root.left);
            stb.append(" ");
        }
        if (root.right != null) {
            postorderToString(stb, root.right);
            stb.append(" ");
        }
        stb.append(root);
    }
    /*</exercise>*/

    /*<exercise chapter="6" section="3" type="programming" number="3">*/
    /** 
     * A method to display the inorder traversal of a binary tree 
     * placeing a left parenthesis before each subtree and a right 
     * parenthesis after each subtree. For example the expression 
     * tree shown in Figure 6.12 would be represented as
     * (((x) + (y)) * ((a) / (b))).
     * @return An inorder string representation of the tree
     */
    public String inorderToString() {
        StringBuilder stb = new StringBuilder();
        inorderToString(stb, root);
        return stb.toString();
    }

    private void inorderToString(StringBuilder stb, Node<E> root) {
        if (root.left != null) {
            stb.append("(");
            inorderToString(stb, root.left);
            stb.append(") ");
        }
        stb.append(root);
        if (root.right != null) {
            stb.append(" (");
            inorderToString(stb, root.right);
            stb.append(")");
        }
    }
    
    public int recursive_get_height(Node<E> root) {
    	if (root.left == null && root.right == null)
    	return 1;
    	int left_height = 0;
    	int right_height = 0;
    	if (root.left != null)
    		left_height = recursive_get_height(root.left);
    	if (root.right != null)
    		right_height = recursive_get_height(root.right);
    	return 1 + Math.max(left_height, right_height);
    	}
    /*</exercise>*/
    
    public int recursive_count_nodes(Node<E> root) {
    	if (root.left == null && root.right == null)
    	return 1;
    	int left_count = 0;
    	int right_count = 0;
    	if (root.left != null)
    	left_count = recursive_count_nodes(root.left);
    	if (root.right != null)
    	right_count = recursive_count_nodes(root.right);
    	return 1 + left_count + right_count;
    	}
    
    public Node<Integer> recursive_search(Node<Integer> root_node,
    		Integer target) {
    		if (root_node == null)
    		return null;
    		if (root_node.data == target) {
    		return (Node<Integer>) root_node;
    		}
    		else if ((Integer) root_node.data < target) {
    		return recursive_search(root_node.right, target);
    		}
    		else {
    		return recursive_search(root_node.left, target);
    		}
    		}
    
    public boolean recursive_is_bst(Node<Integer> root, Integer
    		lower_bound, Integer upper_bound) {
    		if (root == null) return true;
    		if (root.data <= lower_bound || root.data >= upper_bound)
    		return false;
    		return recursive_is_bst(root.left, lower_bound, root.data)
    		&& recursive_is_bst(root.right, root.data, upper_bound);
    		}
    
    public boolean inorder_isbst(Node<E> root) {
    	if (root == null) return true;
    	if (root.left == null && root.right == null)
    		return true;
    	ArrayList<E> value_list = new ArrayList<E>();
    	inOrderTraversal(root, value_list);
    	for (int i = 1; i < value_list.size(); i++) {
    		if ((Integer) value_list.get(i) <= (Integer) value_list.get(i - 1))
    			return false;
    		}
    	return true;
    	}
   
}
/*</listing>*/

