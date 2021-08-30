package Week_4;

public class StevensDatabase {
	
	private Stevens_student[] students;
	
	public StevensDatabase(Stevens_student[] students) {
		this.students = students;
	}
	
	/** search for a student's CWID using the student's first name  
	 *  assume there does not exists two students with the same first name
	 * @param target_firstname: the target student's first name
	 * @return if target_firstname exists in the array students, return the CWID of that student; otherwise, return -1
	 */
	public int search_cwid(String target_firstname) {
		for (int i = 0; i < students.length; i ++) {
			if (students[i].get_firstname() == target_firstname) {
				return students[i].get_cwid();
			}
		}
		return -1;
	}

}

