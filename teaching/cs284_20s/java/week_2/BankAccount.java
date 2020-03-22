package week_2;

public class BankAccount {
	/*balance of bank account */
	private double balance = 0.0;
	
	/* Creates an account setting the balance to 0*/
	public BankAccount(double initialBalance) {
		balance = initialBalance;
	}
	
	
	public void deposit(double amount) {
		balance += amount;
	}
	
	/*Should print an error message if the balance is insufficient. This operation does not return any value.*/
	public void withdraw(double amount) {
		if (amount > balance) {
			System.out.println("Error: insufficient funds");
		}
		else {
			balance -= amount;
		}
	}
	
	public double getBalance() {
		return balance;
	}
	
	/* Should print an error message is there are insufficient funds in the origin account.*/
	public void transfer(double amount, BankAccount destination) {
		if (amount > balance) {
			System.out.println("Error: insufficient funds");
		}
		else {
			balance -= amount;
			destination.deposit(amount);
		}
	}
}