public class Person_2 {
	/* the person's age: instance variable */
  public int age = 23;
  
  /* the person's age: static variable */
  public static int age_static = 30;
  
  public Person_2(){
    age = age + 1;
    age_static = age_static + 1;
    System.out.println("age = " + age + ", static age = " + age_static);
}

public static void main(String[] args) {
	
	/* the static age is increased twice whereas the instance age is increased only once */
	Person_2 mary = new Person_2();
	Person_2 susan = new Person_2();
	
}
}