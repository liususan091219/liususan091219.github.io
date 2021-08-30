package Week_12;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;

public class GroupName {
	public HashMap<Integer, HashSet<String>> update_dict(HashMap<Integer, HashSet<String>> dict, Integer key, String value) {
		if (dict.containsKey(key) == true) {
			HashSet<String> valueset = dict.get(key);
			valueset.add(value);
			dict.put(key, valueset);
		}
		else {
			HashSet<String> valueset = new HashSet<String>();
			valueset.add(value);
			dict.put(key, valueset);
		}
		return dict;
	}
	
	/**
	 * group all names first by the first charcter,
	 * then by the length of the name
	 */
	public void insert_keyval2() {
		HashMap<Character, HashMap<Integer, HashSet<String>>> dict = new HashMap<Character, HashMap<Integer, HashSet<String>>>();
		String[] all_strings = new String[] {"marry", "matt", "nancy", "nelson", "pete", "patrick"};
		
		for (int i = 0; i < all_strings.length; i ++) {
			   String this_name = all_strings[i];
			   Character first_char = this_name.charAt(0);
			   int length = this_name.length();

			  if (dict.containsKey(first_char) == true) {
				 HashMap<Integer, HashSet<String>> updated_list = dict.get(first_char);
			     updated_list = this.update_dict(updated_list, length, this_name);
			     
			     dict.put(first_char, updated_list);
			  }

			  else {
				  HashMap<Integer, HashSet<String>> new_list = new HashMap<Integer, HashSet<String>>();
				  new_list = this.update_dict(new_list, length, this_name);
				  
				  dict.put(first_char, new_list);
			  }
	    }
		
		ArrayList<Character> sorted_keys = new ArrayList<Character>(dict.keySet());
		Collections.sort(sorted_keys);
		
		for (Character this_char: sorted_keys) {
			System.out.println("starting from " + this_char + ":");
			ArrayList<Integer> sorted_keys2 = new ArrayList<Integer>(dict.get(this_char).keySet());
			Collections.sort(sorted_keys2);
			for (Integer each_length: sorted_keys2){
				System.out.print("length = " + each_length + ":");
				
				HashSet<String> values = dict.get(this_char).get(each_length);
				for (String each_val: values)
					System.out.print(each_val + ",");
				System.out.println();
			}
			System.out.println("\n");
		}
	}
	
	/**
	 * group all names by the first charcter,
	 */
	public void insert_keyval() {
		HashMap<Character, ArrayList<String>> dict = new HashMap<Character, ArrayList<String>>();
		String[] all_strings = new String[] {"marry", "matt", "nancy", "nelson", "pete", "patrick"};
		
		for (int i = 0; i < all_strings.length; i ++) {
			   String this_name = all_strings[i];
			   Character first_char = this_name.charAt(0);

			  if (dict.containsKey(first_char) == true) {
			     ArrayList<String> updated_list = dict.get(first_char);
			     updated_list.add(this_name);
			     
			     dict.put(first_char, updated_list);
			  }

			  else {
				  ArrayList<String> new_list = new ArrayList<String>();
				  new_list.add(this_name);
				  
				  dict.put(first_char, new_list);
			  }
	    }
		
		ArrayList<Character> sorted_keys = new ArrayList<Character>(dict.keySet());
		Collections.sort(sorted_keys);
		
		for (Character this_char: sorted_keys) {
			System.out.println("starting from " + this_char + ":");
			for (String each_name: dict.get(this_char)){
				System.out.print(each_name + ",");
			}
			System.out.println("\n");
		}
	}
	
	public static void main(String[] args) throws IOException {
		GroupName test = new GroupName();
		test.insert_keyval2();
	}
}

