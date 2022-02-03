/*<listing chapter="1" number="3">*/
/**
 * Listing 1.3
 * @author Koffman and Wolfgang
 */
package KW.CH01;

/**
 * Class that represents a notebook computer.
 */
public class Notebook extends Computer {
    // Data Fields

    private double screenSize;
    private double weight;

    // Methods
    /**
     * Initializes a Notebook object with all properties specified.
     * @param man The computer manufacturer
     * @param proc The processor type
     * @param ram The RAM size
     * @param disk The disk size
     * @param procSpeed The processor speed
     * @param screen The screen size
     * @param wei The weight
     */
    public Notebook(String man, String proc, double ram, int disk,
            double procSpeed, double screen, double wei) {
        super(man, proc, ram, disk, procSpeed);
        screenSize = screen;
        weight = wei;
    }

    /*<exercise chapter="1" section="3" type="programming" number="1">*/
    public Notebook(String processor, double ram, int disk) {
        this("Default", processor, ram, disk, 2.5, 17, 5.5);
    }
    /*</exercise>*/

    /*<exercise chapter="1" section="2" number="2" type="programming">*/
    // Accessor and modifier methods
    public double getScreenSize() {
        return screenSize;
    }

    public double getWeight() {
        return weight;
    }

    public void setScreenSize(double screen) {
        screenSize = screen;
    }

    public void setWeight(double wei) {
        weight = wei;
    }
    /*</exercise>*/

    /*<exercise chapter="1" section="3" type="programming" number="3">*/
    // See the solution for 1.2.2
    /*</exercise>*/

    /*<exercise chapter="1" section="5" type="programming" number="2">*/
    /**
     * Determine if this Notebook is equal to the other
     * object
     *
     * @param obj The object to compare this Notebook to
     *
     * @return true If the other object is of type Notebook and all
     *         data fields are equal
     */
    @Override
    public boolean equals(Object obj) {
        if (obj == this) {
            return true;
        }

        if (obj == null) {
            return false;
        }

        if (obj.getClass() == this.getClass()) {
            Notebook other = (Notebook) obj;

            return getManufacturer().equals(other.getManufacturer())
                    && getProcessor().equals(other.getProcessor())
                    && (getRamSize() == other.getRamSize())
                    && (getDiskSize() == other.getDiskSize())
                    && (getProcessorSpeed() == other.getProcessorSpeed())
                    && (getScreenSize() == other.getScreenSize())
                    && (getWeight() == other.getWeight());
        } else {
            return false;
        }
    }

    /*</exercise>*/
}
/*</listing>*/
