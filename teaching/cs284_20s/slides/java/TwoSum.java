package Week_4;

public class TwoSum {
	
	/** two sum that takes quadratic running time
	 * 
	 * @param nums: a sorted increasing array, i.e., all elements in nums are non-negative, and each element appears only once, e.g., [2, 7, 11, 15]
	 * @param target: the target value for two sum, e.g., 9
	 * @return an int array which contains the indices of the two numbers, e.g., [0, 1]
	 */
	public int[] twoSum_quadratic(int[] nums, int target) {
        
		for (int i = 0; i < nums.length; i ++)
			for (int j = i + 1; j < nums.length; j ++) {
				if (nums[i] + nums[j] == target) {
					return new int[]{i, j};
				}
			}
		return new int[]{};
    }
	
	/** two sum that takes linear running time
	 * 
	 * @param nums: a sorted increasing array, i.e., all elements in nums are non-negative, and each element appears only once, e.g., [2, 7, 11, 15]
	 * @param target: the target value for two sum, e.g., 9
	 * @return an int array which contains the indices of the two numbers, e.g., [0, 1]
	 */
	public int[] twoSum_linear(int[] nums, int target) {
		int left = 0;
	    int right = nums.length - 1;

	    while(left < right) {
	    	int sum = nums[left] + nums[right];
	        if (sum == target) {
	           return new int[]{left, right};
	        } else if (sum < target) {
	           left++;
	        } else {
	           right--;
	        }
	   }
	   return new int[] {};     
	}
}
