package week_2;
/**Class that represents a computers*/

public class Computer {
	// Data fields
	private String manufacturer;
	private String processor;
	private double ramSize;
	private int diskSize;
	private double processorSpeed;
	
	/** Initializes a Computer object with all properties specified.
    @param man The computer manufacturer
    @param processor The processor type
    @param ram The RAM size
    @param disk The disk size
    @param procSpeed The processor speed
  */  
  public Computer(String man, String processor, double ram, int disk, double procSpeed) {
    manufacturer = man;
    this.processor = processor;
    ramSize = ram;
    diskSize = disk;
    processorSpeed = procSpeed;
  }
  
  public double computePower() 
  { return ramSize * processorSpeed; }
  
  public double getRamSize() { return ramSize; }
  
  public double getProcessorSpeed()  { return processorSpeed; }
  
  public int getDiskSize() { return diskSize; }
  // insert other accessor and modifier methods here

  public String toString() {
  String result = "Manufacturer: " + manufacturer + 
      "\nCPU: " + processor + 
      "\nRAM: " + ramSize + " megabytes" + 
      "\nDisk: " + diskSize + " gigabytes" +
      "\nProcessor speed: " + processorSpeed + 
          " gigahertz";
  return result;
  }
}