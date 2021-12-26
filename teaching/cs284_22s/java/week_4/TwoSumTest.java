package Week_4;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.*;
import org.junit.jupiter.api.Test;

class TwoSumTest {

	@Test
	public void test() {
		TwoSum example = new TwoSum();
		
		int[] nums = {1, 2, 4, 8, 16, 32};
		int target = 12;
		
		int[] index = example.twoSum_linear(nums, target);
		
		Assert.assertArrayEquals(index, new int[] {2, 3});
	}

}
