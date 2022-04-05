package testpackage;
/*
 *  Java Program to Implement AVL Tree
 */

import testpackage.BinaryTree.Node;

/* Class AVLNode */
 class AVLNode
 {    
     AVLNode l_child, r_child;
     int value;
     int height;
 
     /* Constructor */
     public AVLNode()
     {
         l_child = null;
         r_child = null;
         value = 0;
         height = 0;
     }
     /* Constructor */
     public AVLNode(int new_value)
     {
         l_child = null;
         r_child = null;
         value = new_value;
         height = 0;
     }     
     
	void set_value(int new_value) {
		this.value = new_value;
	}
 }
 
 /* Class AVLTree */
 class AVLTree
 {
     private AVLNode root;     
 
     /* Constructor */
     public AVLTree()
     {
         root = null;
     }
     /* Function to check if tree is empty */
     public boolean isEmpty()
     {
         return root == null;
     }
     /* Make the tree logically empty */
     public void makeEmpty()
     {
         root = null;
     }
     /* Function to insert data */
     public void insert(int data)
     {
         root = insertNode(data, root);
     }
     /* Function to get height of node */
     private int height(AVLNode t )
     {
         return t == null ? -1 : t.height;
     }
     /* Function to max of left/right node */
     private int max(int lhs, int rhs)
     {
         return lhs > rhs ? lhs : rhs;
     }
     /* Function to insert data recursively */
     public AVLNode insertNode(int target, AVLNode root)
     {
         if (root == null)
             root = new AVLNode(target);
         
         else if (target < root.value) 
         {
             root.l_child = insertNode( target, root.l_child ); 
             int balance = getBalance(root);
             
             if( balance == -2 )  {
                 if( target < root.l_child.value )                        
                     root = rotateRight( root );    
                 else
                     root = doubleRotation_left_right( root );
                 System.out.println(target);
             }
         }
  
         else if( target > root.value )                 
         {   
             root.r_child = insertNode( target, root.r_child );     
             int balance = getBalance(root);
 
             if( balance == 2 )   
            	 
                 if( target > root.r_child.value)
                     root = rotateLeft( root );  
                 else
                     root = doubleRotation_right_left( root );          
         }
         else
           ;  
         root.height = max( height( root.l_child ), height( root.r_child ) ) + 1;   // update the height of the current node t
         return root;
     }
     /* Rotate binary tree node with left child */     
     private AVLNode rotateRight(AVLNode root)
     {
         AVLNode tmp = root.l_child;
         root.l_child = tmp.r_child;
         tmp.r_child = root;
         
         root.height = max( height( root.l_child ), height( root.r_child ) ) + 1;
         tmp.height = max( height( tmp.l_child ), root.height ) + 1;
         return tmp;
     }
 
     /* Rotate binary tree node with right child */
     private AVLNode rotateLeft(AVLNode root)
     {
         AVLNode tmp = root.r_child;
         root.r_child = tmp.l_child;
         tmp.l_child = root;
         root.height = max( height( root.l_child ), height( root.r_child ) ) + 1;
         tmp.height = max( height( tmp.r_child ), root.height ) + 1;
         return tmp;
     }
     /**
      * Double rotate binary tree node: first left child
      * with its right child; then node k3 with new left child */
     private AVLNode doubleRotation_left_right(AVLNode root)
     {
         root.l_child = rotateLeft( root.l_child );
         return rotateRight( root );
     }
     /**
      * Double rotate binary tree node: first right child
      * with its left child; then node k1 with new right child */      
     private AVLNode doubleRotation_right_left(AVLNode root)
     {
         root.r_child = rotateRight( root.r_child );
         return rotateLeft( root );
     }    
     /* Functions to count number of nodes */
     public int countNodes()
     {
         return countNodes(root);
     }
     private int countNodes(AVLNode r)
     {
         if (r == null)
             return 0;
         else
         {
             int l = 1;
             l += countNodes(r.l_child);
             l += countNodes(r.r_child);
             return l;
         }
     }
     
     public boolean search(AVLNode root, int target)
     {
         boolean found = false;
         while ((root != null) && !found)
         {
             int rval = root.value;
             if (target < rval)
                 root = root.l_child;
             else if (target > rval)
                 root = root.r_child;
             else
             {
                 found = true;
                 break;
             }
             found = search(root, target);
         }
         return found;
     }
     
     public int getBalance(AVLNode root) {
    	 if (root == null)
    		 return 0;
    	 return height(root.r_child) - height(root.l_child);
     }
     
     public AVLNode deleteNode(AVLNode root, int target)  
     {  
         if (root == null)  
             return root;  
   
         if (target < root.value)  
             root.l_child = deleteNode(root.l_child, target);  
   
         // If the key to be deleted is greater than the  
         // root's key, then it lies in right subtree  
         else if (target > root.value)  
             root.r_child = deleteNode(root.r_child, target);  
   
         // if key is same as root's key, then this is the node  
         // to be deleted  
         else
         {  
   
             // node with only one child or no child  
             if ((root.l_child == null) || (root.r_child == null))  
             {  
                 if (root.l_child == null)  
                     root = root.r_child;  
                 else
                     root = root.l_child;  
             }  
             else
             {  
                 // node with two children: Get the inorder  
                 // successor (smallest in the right subtree)  
            	 AVLNode right = minValueNode(root.r_child);  
   
                 // Copy the inorder successor's data to this node  
                 root.value = right.value;  
   
                 // Delete the inorder successor  
                 root.r_child = deleteNode(root.r_child, right.value);  
             }  
         }  
         
         if (root == null)  
             return root;  
   
         root.height = max(height(root.l_child), height(root.r_child)) + 1;  
   
         int balance = getBalance(root);  
         
      // if after the deletion, the tree becomes unbalanced
         if (balance == 2) {
        	 int rchild_balance = getBalance(root.r_child);
        	 // right-right tree
        	 if (rchild_balance >= 0)
        		 return rotateLeft(root);
        	 // right-left tree
        	 else
        		 return doubleRotation_right_left(root);
         }
   
      // if after the deletion, the tree becomes unbalanced
         if (balance == -2) {
        	 int lchild_balance = getBalance(root.l_child);
        	 // left-left tree
        	 if (lchild_balance <= 0)  
        		 return rotateRight(root);
        	 // left-right tree
        	 else
        		 return doubleRotation_left_right(root); 
         }      
   
         return root;  
     }  
     
     AVLNode minValueNode(AVLNode node)  
     {  
    	 AVLNode current = node;  
   
         /* loop down to find the leftmost leaf */
         while (current.l_child != null)  
         current = current.l_child;  
   
         return current;  
     }  
     
     public void preOrder(AVLNode node)  
     {  
         if (node != null)  
         {  
             System.out.print(node.value + " ");  
             preOrder(node.l_child);  
             preOrder(node.r_child);  
         }  
     }  
     
     public static void main(String[] args)  
     {  
         AVLTree tree = new AVLTree();  
   
         tree.root = tree.insertNode(9, tree.root);  
         tree.root = tree.insertNode(5, tree.root);  
         tree.root = tree.insertNode(10, tree.root);  
         tree.root = tree.insertNode(0, tree.root);  
         tree.root = tree.insertNode(6, tree.root);  
         tree.root = tree.insertNode(11, tree.root);  
         tree.root = tree.insertNode(-1, tree.root);  
         tree.root = tree.insertNode(1, tree.root);  
         tree.root = tree.insertNode(2, tree.root);  
   
         /* The constructed AVL Tree would be  
         9  
         / \  
         1 10  
         / \ \  
         0 5 11  
         / / \  
         -1 2 6  
         */
         
         System.out.println("Preorder traversal of "+  
                             "constructed tree is : ");  
         tree.preOrder(tree.root);  
   
//         tree.root = tree.deleteNode(tree.root, 10);  
//   
//         /* The AVL Tree after deletion of 10  
//         1  
//         / \  
//         0 9  
//         /\ \ 
//       -1 5  11  
//         / \  
//         2 6  
//         */
//         System.out.println("");  
//         System.out.println("Preorder traversal after "+  
//                         "deletion of 10 :");  
//         System.out.println(tree.toString());  
     }  
     
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
     public void preOrderTraverse(AVLNode node, int depth,
             StringBuilder sb) {
         for (int i = 1; i < depth; i++) {
             sb.append("  ");
         }
         if (node == null) {
             sb.append("null\n");
         } else {
             sb.append(node.value);
             sb.append("\n");
             preOrderTraverse(node.l_child, depth + 1, sb);
             preOrderTraverse(node.r_child, depth + 1, sb);
         }
     }
 }
