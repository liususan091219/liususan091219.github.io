package testpackage;

import java.util.LinkedList;
import java.util.Queue;

public class QueueStack<E> {
	Queue<E> queue = new LinkedList<E>();
	
	public void push(E x) {
		queue.add(x);
		for(int i = 0; i < queue.size() - 1; i++){
		queue.add(queue.poll());
		}
		}
	
	public E pop() {
		return queue.poll();
		}
		/** Get the top element. */
		public E top() {
		return queue.peek();
		}
		/** Returns whether the stack is empty. */
		public boolean empty() {
		return queue.isEmpty();
		}
}

