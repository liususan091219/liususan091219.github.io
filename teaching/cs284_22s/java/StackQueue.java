package testpackage;

import java.util.Collection;
import java.util.Iterator;
import java.util.Queue;
import java.util.Stack;

public class StackQueue<E> implements Queue<E> {
	
	Stack<E> stack1 = new Stack<E>();
	Stack<E> stack2 = new Stack<E>();
	
	public boolean add(E element) {
		stack1.push(element);
		return true;
	}
		/** popping from/poll from top of stack B
		* when stack B is empty, always dump *all*
		* elements from stack A to stack B
		* @return
		*/
	public E poll() {
		if(stack2.empty()){
			while(!stack1.empty()){
				stack2.push(stack1.pop());
			}
		}
	return stack2.pop();
	}

	public E peek() {
		if(stack2.empty()){
		while(!stack1.empty()){
		stack2.push(stack1.pop());
		}
		}
		return stack2.peek();
		}
	
	@Override
	public int size() {
		// TODO Auto-generated method stub
		return 0;
	}
	@Override
	public boolean isEmpty() {
		// TODO Auto-generated method stub
		return stack1.isEmpty() && stack2.isEmpty();
	}
	@Override
	public boolean contains(Object o) {
		// TODO Auto-generated method stub
		return false;
	}
	@Override
	public Iterator<E> iterator() {
		// TODO Auto-generated method stub
		return null;
	}
	@Override
	public Object[] toArray() {
		// TODO Auto-generated method stub
		return null;
	}
	@Override
	public <T> T[] toArray(T[] a) {
		// TODO Auto-generated method stub
		return null;
	}
	@Override
	public boolean remove(Object o) {
		// TODO Auto-generated method stub
		return false;
	}
	@Override
	public boolean containsAll(Collection<?> c) {
		// TODO Auto-generated method stub
		return false;
	}
	@Override
	public boolean addAll(Collection<? extends E> c) {
		// TODO Auto-generated method stub
		return false;
	}
	@Override
	public boolean removeAll(Collection<?> c) {
		// TODO Auto-generated method stub
		return false;
	}
	@Override
	public boolean retainAll(Collection<?> c) {
		// TODO Auto-generated method stub
		return false;
	}
	@Override
	public void clear() {
		// TODO Auto-generated method stub
		
	}
	@Override
	public boolean offer(E e) {
		// TODO Auto-generated method stub
		return false;
	}
	@Override
	public E remove() {
		// TODO Auto-generated method stub
		return null;
	}
	@Override
	public E element() {
		// TODO Auto-generated method stub
		return null;
	}
}

