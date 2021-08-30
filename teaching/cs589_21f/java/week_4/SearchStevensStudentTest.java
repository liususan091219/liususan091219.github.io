package Week_4;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.Assert;
import org.junit.jupiter.api.Test;

class SearchStevensStudentTest {

	@Test
	void test() {
		
		Stevens_student[] students = { new Stevens_student("Susan", 123),
				   new Stevens_student("Mary", 456)};
		StevensDatabase search_student = new StevensDatabase(students);
		
		Assert.assertEquals(search_student.search_cwid("Susan"), 123);
	}
}

