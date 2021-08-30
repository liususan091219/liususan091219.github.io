public class Person_4 {
	
  private static int age_static;
 
  public Person_4(int age) {
	  this.age = age;
  }
 
  /* the person's age */
  private int age;
  
  public void incAge() {
	  this.age = this.age + 1;
  }
  
  public int getAge() {
	  return this.age;
  }
 
  
  public static void incAge(Person_4 person) {
     person.incAge();
}
  
  public static void main(String[] args){
      Person_4 mary = new Person_4(23);

      System.out.println(mary.getAge());
      
      Person_4.incAge(mary); // what is mary_age?
      
      /* mary's age is changed because an object is passed to the method incAge */
      System.out.println(mary.getAge());
     
      
  }
}