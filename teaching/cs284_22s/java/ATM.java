/*<listing chapter="1" number="1">*/
/**
Listing 1.1
@author Koffman and Wolfgang
 */
package KW.CH01;

/** The interface for an ATM. */
public interface ATM {

    /**
     *  Verifies a user's PIN.
     *  @param pin The user's PIN
     */
    boolean verifyPIN(String pin);

    /**
     * Allows the user to select an account.
     *  @return a String representing the account selected
     */
    String selectAccount();

    /**
     * Withdraws a specified amount of money
     *  @param account The account from which the money comes
     *  @param amount The amount of money withdrawn
     *  @return Whether or not the operation is successful
     */
    boolean withdraw(String account, double amount);

    /**
     * Displays the result of an operation
     *  @param account The account for the operation
     *  @param amount The amount of money
     *  @param success Whether or not the operation was successful
     */
    void display(String account, double amount, boolean success);

    /**
     * Displays the result of a PIN verification
     * @param pin The user's pin
     * @param success Whether or not the PIN was valid
     */
    void display(String pin, boolean success);

    /**
     * Displays an account balance
     * @param account The account selected
     */
    void showBalance(String account);
}
/*</listing>*/
