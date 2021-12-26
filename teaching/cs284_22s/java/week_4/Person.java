package Week_4;

public abstract class Person {

	private String first_name = "";
	
	public Person(String first_name) {
		this.first_name = first_name;
	}
	
	public String get_firstname() {
		return this.first_name;
	}
	
	/** 
	 * set the first name of a person
	 * @param first_name: the first name of the person
	 */
	public void set_firstname(String first_name) {
		this.first_name = first_name;
	}
}

