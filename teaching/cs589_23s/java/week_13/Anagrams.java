package Week_12;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.HashMap;

public class Anagrams {
	
	public HashMap<Integer, Integer> test_hashtable = new HashMap<Integer, Integer>();
	
	public void read_file_test(String file_name) throws IOException {
		  FileInputStream fstream = new FileInputStream(file_name);
		  BufferedReader br = new BufferedReader(new InputStreamReader(fstream));
		  String strLine;
		  while ((strLine = br.readLine()) != null)   {
		    //this.addWord(strLine);
		  }
		  br.close();
	}
	
	public void write_file_test(String file_name) throws IOException {
		FileOutputStream fstream = new FileOutputStream(file_name);
		BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(fstream));
		
		for (Integer key: test_hashtable.keySet()) {
			bw.write(key + "\t" + test_hashtable.get(key) + "\n");
		}
		
		bw.close();
	}
	
	public void test_write_test() throws IOException {
		test_hashtable.put(2, 1);
		test_hashtable.put(3, 1);
		test_hashtable.put(4, 2);
		
		this.write_file_test("/Users/xliu127/Desktop/test.txt");//replace with your path
	}
	
	public static void main(String[] args) throws IOException {
		Anagrams anagrams = new Anagrams();
		anagrams.test_write_test();
	}
}

