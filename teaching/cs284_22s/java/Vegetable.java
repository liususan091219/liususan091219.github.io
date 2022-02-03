/*<exercise chapter="1" section="4" type="programming" number="1">*/
package KW.CH01;

/**
 * Class to represent a Vegetable
 */
public class Vegetable extends Food {

    /** Calories from protein */
    private static final double VEG_PROTEIN_CAL = 0.35;
    /** Calories from fat */
    private static final double VEG_FAT_CAL = 0.15;
    /** Calories from carbohydrates */
    private static final double VEG_CARBO_CAL = 0.50;
    /** The name of the vegetable */
    private String name;

    /**
     * Constructor
     * @param name The name of the vegetable
     */
    public Vegetable(String name) {
        this.name = name;
        setCalories(VEG_PROTEIN_CAL + VEG_FAT_CAL + VEG_CARBO_CAL);
    }

    /** 
     * Calculates the percent of protein in a Food object.
     * @return The percentage of protein
     */
    public double percentProtein() {
        return VEG_PROTEIN_CAL / getCalories();
    }

    /** 
     * Calculates the percent of fat in a Food object.
     * @return The precentage of fat
     */
    public double percentFat() {
        return VEG_FAT_CAL / getCalories();
    }

    /** 
     * Calculates the percent of carbohydrates in a Food object.
     * @return The percentage of carbohydrates
     */
    public double percentCarbohydrates() {
        return VEG_CARBO_CAL / getCalories();
    }
}
/*</exercise>*/
