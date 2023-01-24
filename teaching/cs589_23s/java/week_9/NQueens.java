package Week_9;

import java.util.ArrayList;

public class NQueens { 
 final int N = 8; 
 
 int solution_count = 0;

 public void printSolution(int board[][]) 
 { 
	 System.out.print(solution_count + " : ");
	 solution_count ++;
     for (int i = 0; i < N; i++) { 
         for (int j = 0; j < N; j++) {
        	 if (board[i][j] == 1)
        		 System.out.print(" " + j + " ");
         }
         
     } 
     System.out.println(); 
 } 

 /** check whether the existing partial solution allow us 
  * place the queen at position (row, col)
  * @param board
  * @param row
  * @param col
  * @return
  */
 public boolean isSafe(int board[][], int row, int col) 
 { 
     int i, j; 
     /* Check whether there are elements on the same row
      * There will not be elements on the same col, 
      * because we are enumerating on the col
      */
     for (i = 0; i < col; i++) 
         if (board[row][i] == 1) 
             return false; 

     /* Check whether there are elements on the same upper diagonal */
     for (i = row, j = col; i >= 0 && j >= 0; i--, j--) 
         if (board[i][j] == 1) 
             return false; 

     /* Check whether there are elements on the same lower diagonal */
     for (i = row, j = col; j >= 0 && i < N; i++, j--) 
         if (board[i][j] == 1) 
             return false; 

     return true; 
 } 

 /**
  * Recursive algorithm: for each column, try searching 
  * to place the queen at each row
  * @param board
  * @param col
  */
 public void try_place_queen(int board[][], int col) 
 { 
	 // if reaching the terminal, it means no violation
	 // therefore update the optimal solution
     if (col >= N) { 
    	 printSolution(board);
         return; 
     }
     
     /* Search by col: try placing the queen at col
      * on row = i */
     for (int i = 0; i < N; i++) { 
    	 
    	 /* check the validity of the partial solution
    	  * if it's safe, continue the search, otherwise, 
    	  * prune the partial solution and search the next solution
    	  */
         if (isSafe(board, i, col)) { 
        	 
             board[i][col] = 1; 

             /* for the next col, enumerate the row number */
             try_place_queen(board, col + 1); 

             board[i][col] = 0; // BACKTRACK 
         } 
     } 
 } 

 public void solveNQ() 
 { 
     int board[][] = { { 0, 0, 0, 0, 0, 0, 0, 0 }, 
    		 { 0, 0, 0, 0, 0, 0, 0, 0 }, 
    		 { 0, 0, 0, 0, 0, 0, 0, 0 }, 
    		 { 0, 0, 0, 0, 0, 0, 0, 0 },
    		 { 0, 0, 0, 0, 0, 0, 0, 0 },
    		 { 0, 0, 0, 0, 0, 0, 0, 0 },
    		 { 0, 0, 0, 0, 0, 0, 0, 0 },
    		 { 0, 0, 0, 0, 0, 0, 0, 0 }}; 

     try_place_queen(board, 0);
 } 

 // driver program to test above function 
 public static void main(String args[]) 
 { 
	 ArrayList<String> ls = new ArrayList<>();
	 ls.get(0);
	 
     NQueens Queen = new NQueens(); 
     Queen.solveNQ(); 
 } 
} 
