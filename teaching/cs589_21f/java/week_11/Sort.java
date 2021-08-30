package Week_11;

import java.util.HashMap;

import junit.framework.Assert;

public class Sort<E extends Comparable<E>> {
	
	  int swap_count = 0;
	  int compare_count = 0;
	  HashMap<Integer, Integer> swap_count_array = new HashMap<Integer, Integer>();
	  HashMap<Integer, Integer> compare_count_array = new HashMap<Integer, Integer>();
	  
	  public void quick_sort(E[] a) {
	        recursive_quicksort(a, 0, a.length - 1);
	  }

	  /** Sort the table using quick sort algorithm.
	   * (1) divide-and-conquer: choose the first element
	   * as the pivot, partition the array such that
	   * all the smaller elements are on the left, and
	   * all the larger elements are on the right
	   * (2) recursively sort the left and right half
	   * @param a
	   * @param first
	   * @param last
	   */
	  public void recursive_quicksort(E[] a, int first, int last) {
		  
        int pivIdx = partition(a, first, last);
        
        if (first < pivIdx - 1)
        	recursive_quicksort(a, first, pivIdx - 1);
        
        if (pivIdx + 1 < last)
        	recursive_quicksort(a, pivIdx + 1, last);
	  }

	  /** Partition the array (two pointer)
	   * (1) choose the first element as the pivot
	   * (2) find the first element larger than pivot from left
	   * (3) find the first element smaller than pivot from right 
	   * (4) swap the two elements and continue, until the left 
	   * pointer > right pointer 
	   * (5) swap the pivot and the last element in the first half
	   * @param a
	   * @param first
	   * @param last
	   * @return
	   */
	  public int partition(E[] a, int first, int last) {
	    E pivot = a[first];
	    int up = first;
	    int down = last;
	    do {
	        while ((up < last) && (up<last) && (pivot.compareTo(a[up])>=0)) { 
	           up++; }
	        while (down > first && pivot.compareTo(a[down]) < 0) {
	          down--;
	        }
	         if (up < down) { // if up is to the left of down.
	        	 E temp = a[up];
	        	 a[up] = a[down];
	        	 a[down] = temp;
	        }
	      } while (up < down); // Repeat while up is left of down.

	    E temp = a[first];
	    a[first] = a[down];
	    a[down] = temp;
	    
	    return down;
	 }
	  
	  /**
	   * Sort the table using selection sort algorithm.
	   * swap & compare: 
		     swap count: best case O(n), worst case O(n^2)
		     compare count: best case O(n^2), worst case O(n^2) 
	     Selection sort does more comparison, fewer swaps
	   * @param a
	   */
	  
	  public void selection_sort(E[] a) {
		    int n = a.length;
		    
		    for (int round = 0; round < n-1; round++) {
		      int next_smallest_idx = round;

		     /** find the smallest element starting from current_idx
		      *  swap the current element with the smallest elemnt
		      *  so after the round-th round, the current_idx-th smallest item is in place
		      */
		     for (int next_idx = round + 1; next_idx < n; next_idx++) {
		         if (a[next_idx].compareTo(a[round]) < 0) {
			          next_smallest_idx = next_idx;
		    	 }
		         compare_count += 1;
		      }
		      
		      E temp = a[round];
		      a[round]     = a[next_smallest_idx];
		      a[next_smallest_idx]   = temp;
		      swap_count += 1;
		    }
      }  
	  
	  /**
	   * Sort the table using bubble sort algorithm.
	   * swap & compare: 
		     swap count: best case O(1), worst case O(n^2)
		     compare count: best case O(n), worst case O(n^2) 
	     Bubble sort always swap locally, so in general, more swap is needed to get every elements in place
	   * @param a
	   */
	  
	  public void bubble_sort(E[] a) {
		    int round = 1;
		    
		    boolean exchanges = false;
		    do {
		       exchanges = false; 
		       /** 
		        * The pass-th round: swap adjacent out-of-order elements from 0...a.length - round
		        * At the end of the round-th round, the round-th largest element is in place
		        */
		       		
		       for (int i = 0; i < a.length - round; i++) {
		         if (a[i].compareTo(a[i + 1]) > 0) {
		            E temp = a[i];
		            a[i] = a[i + 1];
		            a[i + 1] = temp;
		            swap_count += 1;
		            exchanges = true; 
		        }
		        compare_count += 1;
		      }
		       round++;
		    } while (exchanges);
		 
	  }
	  
	 public void shell_sort(E[] table) {
		 
		 int[] gap_seq = {5, 3, 1};
		 
		 
		 for (int h: gap_seq) {
			 
			 for (int pos = h; pos < table.length; pos ++) {
				 insertion_step(table, pos, h);
			 }
		 }
	 }
	  
	 /** Sort the table using insertion sort algorithm.
      pre:  table contains Comparable objects.
      post: table is sorted.
      swap & compare: 
	     swap count: best case O(n), worst case O(n^2)
	     compare count: best case O(n), worst case O(n^2) 
	     swap count is similar to compare count
      @param table The array to be sorted
     */
	 public void insertion_sort(E[] table) {
	     for (int pos = 1; pos < table.length; pos++) {
	       insertion_step(table, pos, 1);
	     }
	 }
	 
	 public void print_array(E[] a) {
		 for (int i = 0; i < a.length; i++)
			 System.out.print(a[i].toString() + ",");
		 System.out.println();
	 }
	   
	 /** Insert the element at next_idx where it belongs
     in the array.
     pre:  table[0...next_idx-1] is sorted.
     post: table[0...next_idx] is sorted.
     @param table The array being sorted
     @param nextPos The position of the element to insert
     */
	 
	 public HashMap<Integer, Integer> update_dict_count(HashMap<Integer, Integer> dict, int key, int inc) {
		 Integer origin_val = dict.get(key);
		 if (origin_val == null) {
			 dict.put(key, inc);
		 }
		 else {
			 dict.replace(key, origin_val + inc);
		 }
		 return dict;
	 }
	 
	 public void insertion_step(E[] a, int this_idx, int stride) {		 
         E this_val = a[this_idx]; 
         while (this_idx >= stride && this_val.compareTo(a[this_idx - stride]) < 0) {
              a[this_idx] = a[this_idx - stride]; 
              swap_count += 1;
              compare_count += 1;
              
              swap_count_array = this.update_dict_count(swap_count_array, stride, 1);
              compare_count_array = this.update_dict_count(compare_count_array, stride, 1);
              
              this_idx-= stride; 
         }
         a[this_idx] = this_val;
	  }
	 
	 public void test_1() {
		  Sort<Integer> sort = new Sort<Integer>();
		  Integer[] array = new Integer[] {60, 42, 75, 83, 27};
		  
		  System.out.print("Before insertion: ");
		  sort.print_array(array);
		  
		  sort.quick_sort(array);
		  
		  System.out.print("After insertion: ");
		  sort.print_array(array);
		  
		  System.out.println("The number of swaps of this sorting algorithm is: " + sort.swap_count);
		  System.out.println("The number of comparison of this sorting algorithm is: " + sort.compare_count);		 
	 }
	 
	 public void test_2() {
		 Sort<String> sort = new Sort<String>();
		 String[] array = new String[] {"S", "O", "R", "T", "E", "X", "A", "M", "P", "L", "E"};
		 
		 System.out.print("Before insertion: ");
		 sort.print_array(array);
		  
		 sort.shell_sort(array); 
		 
		 System.out.print("After insertion: ");
		 sort.print_array(array);
		 
		 System.out.println("The number of swaps of this sorting algorithm is: " + sort.swap_count);
		 System.out.println("The number of comparison of this sorting algorithm is: " + sort.compare_count);
		 
		 for (Integer key: sort.swap_count_array.keySet()) {
			 System.out.println("stride = " + key + ", swap_count = " + sort.swap_count_array.get(key));
		 }
		 
		 for (Integer key: sort.swap_count_array.keySet()) {
			 System.out.println("stride = " + key + ", compare_count = " + sort.compare_count_array.get(key));
		 }
	 }
	  
	 public static void main(String[] args) {
		  Sort sort = new Sort();
		  sort.test_1();
	 }
}

