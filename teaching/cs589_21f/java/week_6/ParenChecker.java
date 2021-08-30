package Week_6;

import java.util.Stack;

public class ParenChecker {
	
	public ParenChecker() {
		
	}

    public boolean isBalanced(String expression) {
	    Stack<Integer> s = new Stack<Integer>();
	      int index = 0;
	      while (index < expression.length()) {
            char nextCh = expression.charAt(index);
            if (nextCh == '(') {
                s.push(1);
            } 
            else if (nextCh == ')'){
            	 try 
            	 {
            		 s.pop();
            	 }
            	 catch(Exception e) {
            		 return false;
            	 }
            }
            index++;
	    }
	    return s.empty();
    }
    
    public static void main(String[] args) {
    	ParenChecker pc = new ParenChecker();
    	System.out.println(pc.isBalanced("a((()) + ()"));
    }
}
