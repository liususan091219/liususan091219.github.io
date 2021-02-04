
public class Array {
	public static void main(String[] args) {
		int[] data1 = {1,2,3,4,5};
		int[] data2 = data1;
		data2[0] = 8;
		System.out.println(data1[0]);
	}
}
