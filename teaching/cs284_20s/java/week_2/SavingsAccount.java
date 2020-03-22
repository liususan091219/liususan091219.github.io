package week_2;

import week_2.BankAccount;

public class SavingsAccount extends BankAccount {
	/*balance of bank account */
	private double rate = 0;
	
	/** create a savings account with the given interest rate and 0 as balance. Eg. For a 1\% interest*/
	public SavingsAccount(double rate) {
		super(0.0);
		this.rate = rate;
	}
	
	/** deposits the interest w.r.t. the current balance*/
	public void addInterests() {
		double current_balance = super.getBalance();
		super.deposit(current_balance * rate);
	}
	
	public static void main(String[] args) {
		SavingsAccount sa = new SavingsAccount(0.01);
	}
}