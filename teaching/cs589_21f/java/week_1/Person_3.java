public class Person_3 {
	
  public void incAge(int age) {
     age = age + 1;
}
  public static void main(String[] args){
      Person_3 mary = new Person_3();
      int mary_age = 23;
      mary.incAge(mary_age); // what is mary_age?
      
      /* mary's age is not changed because Java is call-by-value */
      System.out.println(mary_age);
  }
}