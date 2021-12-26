package Week_14;

public class TupleSort {
	
   class Tuple implements Comparable<Tuple>{
	    int[] tuple;
		
		public Tuple(int[] this_tuple) {
			this.tuple = this_tuple;
		}

		@Override
		public int compareTo(Tuple other_tuple) {
			/*
			 * return -1 if this tuple < other tuple
			 * return 1 if this tuple > other tuple
			 * return 0 if they are equal
			 */
			
			return 0;
		}
	}
   
   public Tuple[] tuple_sort(Tuple[] array) {
	   return null;
   }
}
