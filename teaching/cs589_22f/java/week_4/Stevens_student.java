package Week_4;

public class Stevens_student extends Person{
	
	private int CWID;
	
	/**
	 * Constructor method for Stevens_student
	 * @param first_name
	 * @param CWID
	 */
	public Stevens_student(String first_name, int CWID) {
		super(first_name);
		this.CWID = CWID;
	}
	
	public int get_cwid() {
		return this.CWID;
	}
}

