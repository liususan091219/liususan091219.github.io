package KW.CH01;

/**
 * The class ATMbankAmerica
 */
public class ATMbankAmerica implements ATM {
    /*<exercise chapter="1" section="1" type="programming" number="4">*/

    /** The user's PIN */
    private String pin;

    /**
     * Verifies a user's PIN.
     * @param pin The user's PIN
     * @return true if the user's PIN is verified
     */
    @Override
    public boolean verifyPIN(String pin) {
        return this.pin.equals(pin);
    }

    /*</exercise>*/
    // The following are all dummy methods
    /**
     * Allows the user to select an account.
     * @return a String representing the account selected
     */
    @Override
    public String selectAccount() {
        return null;
    }

    /**
     * Withdraws a specified amount of money
     * @param account The account from which the money comes
     * @param amount The amount of money withdrawn
     * @return Whether or not the operation is successful
     */
    @Override
    public boolean withdraw(String account, double amount) {
        return false;
    }

    /**
     * Displays the result of an operation
     * @param account The account for the operation
     * @param amount The amount of money
     * @param success Whether or not the operation was successful
     */
    @Override
    public void display(String account, double amount, boolean success) {
    }

    /**
     * Displays the result of a PIN verification
     * @param pin The user's pin
     * @param success Whether or not the PIN was valid
     */
    @Override
    public void display(String pin, boolean success) {
    }

    /**
     * Displays an account balance
     * @param account The account selected
     */
    @Override
    public void showBalance(String account) {
    }
}
