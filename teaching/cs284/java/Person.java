public class Person{
  // data fields
  /* the person's age */
  private int age;
  
  /* clone a person object */
  @Override
  public Person clone() {
	  Person new_person = new Person(this.getAge());
	  return new_person;
  }
  
  /* constructor method */
  public Person(int age){
    this.age = age;
  }
  
  /* return the person's age */
  public int getAge(){
    return this.age;
}
  /* set the person's age */
  public void setAge(int age){
    this.age = age;
} 
  public static void main (String[] args) throws CloneNotSupportedException{
  	 Person mary = new Person(23);
  	 Person susan = mary;
     System.out.println("susan's age is " + susan.getAge());

     mary.setAge(30);
     /* referencing object: after changing mary's age, susan's age is also changed */
     System.out.println("susan's age is " + susan.getAge());
  }
}
