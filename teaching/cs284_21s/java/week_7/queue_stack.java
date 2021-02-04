import java.util.Stack;

public class Queue_stack {
	    private Stack<Integer> stack1;
	    private Stack<Integer> stack2;
	    private Stack<Integer> curStack;

	    public Queue_stack() {
	        stack1 = new Stack<>();
	        stack2 = new Stack<>();
	    }

	    public void add(int element) {
	        stack1.push(element);
	    }

	    /** popping from/poll from top of stack B 
	     * when stack B is empty, always dump *all* 
	     * elements from stack A to stack B
	     * @return
	     */
	    public int poll() {
	        if(stack2.empty()){
	            while(!stack1.empty()){
	                stack2.push(stack1.pop());
	            }
	        }
	        return stack2.pop();
	    }

	    /** getting the first element from stack B 
	     * when stack B is empty, always dump *all* 
	     * elements from stack A to stack B
	     * @return
	     */
	    public int peek() {
	        if(stack2.empty()){
	            while(!stack1.empty()){
	                stack2.push(stack1.pop());
	            }
	        }
	        return stack2.peek();
	    }
}

