package Week_12;

/**
 * Assignment: Week 10 HW 1
 *             Programming Project 7, pg. 417
 *              
 * File: HashtableCahin.java
 * 
 * @author Evan Carey
 * 
 * Problem Statement: Comple class HashtableChain so that it fully implements
 * the Map interface, and test it out. Complete class SetIterator as described
 * in Project 6.
 */
import java.util.AbstractSet;
import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;

/**
 * Hash table implementation using chaining.
 *  @author Koffman and Wolfgang
 **/
public class HashtableChain<K, V> implements Map<K, V> {

    /** The table */
    private LinkedList<Entry<K, V>>[] table;
    /** The number of keys */
    private int numKeys;
    /** The capacity */
    private static final int CAPACITY = 101;
    /** The maximum load factor */
    private static final double LOAD_THRESHOLD = 3.0;

    /** Contains key-value pairs for a hash table. */
    private static class Entry<K, V> implements Map.Entry<K, V> {

        /** The key */
        private K key;
        /** The value */
        private V value;

        /**
         * Creates a new key-value pair.
         * @param key The key
         * @param value The value
         */
        public Entry(K key, V value) {
            this.key = key;
            this.value = value;
        }

        /**
         * Retrieves the key.
         * @return The key
         */
        @Override
        public K getKey() {
            return key;
        }

        /**
         * Retrieves the value.
         * @return The value
         */
        @Override
        public V getValue() {
            return value;
        }

        /**
         * Sets the value.
         * @param val The new value
         * @return The old value
         */
        @Override
        public V setValue(V val) {
            V oldVal = value;
            value = val;
            return oldVal;
        }
        
        /**
         * Returns a string representation of the Entry.
         * @return The string in format "key=value"
         */
        public String toString() {
            return key + "=" + value;
        }
    }

    // Constructor
    /**
     * Construct a new HashtableChain object of size CAPACITY
     */
    @SuppressWarnings("unchecked")
    public HashtableChain() {
        table = new LinkedList[CAPACITY];
    }

    /*<listing chapter="7" number="9">*/
    /**
     * Method get for class HashtableChain.
     * @param key The key being sought
     * @return The value associated with this key if found;
     *         otherwise, null
     */
    @Override
    public V get(Object key) {
        int index = key.hashCode() % table.length;
        if (index < 0) {
            index += table.length;
        }
        if (table[index] == null) {
            return null; // key is not in the table.
        }
        // Search the list at table[index] to find the key.
        for (Entry<K, V> nextItem : table[index]) {
            if (nextItem.key.equals(key)) {
                return nextItem.value;
            }
        }

        // assert: key is not in the table.
        return null;
    }
    /*</listing>*/

    /*<listing chapter="7" number="10">*/
    /**
     * Method put for class HashtableChain.
     * @post This key-value pair is inserted in the
     *       table and numKeys is incremented. If the key is already
     *       in the table, its value is changed to the argument
     *       value and numKeys is not changed.
     * @param key The key of item being inserted
     * @param value The value for this key
     * @return The old value associated with this key if
     *         found; otherwise, null
     */
    @Override
    public V put(K key, V value) {
        int index = key.hashCode() % table.length;
        if (index < 0) {
            index += table.length;
        }
        if (table[index] == null) {
            // Create a new linked list at table[index].
            table[index] = new LinkedList<Entry<K, V>>();
        }

        // Search the list at table[index] to find the key.
        for (Entry<K, V> nextItem : table[index]) {
            // If the search is successful, replace the old value.
            if (nextItem.key.equals(key)) {
                // Replace value for this key.
                V oldVal = nextItem.value;
                nextItem.setValue(value);
                return oldVal;
            }
        }

        // assert: key is not in the table, add new item.
        table[index].addFirst(new Entry<K, V>(key, value));
        numKeys++;
        if (numKeys > (LOAD_THRESHOLD * table.length)) {
            rehash();
        }
        return null;
    }
    /*</listing>*/
    
    /** Returns true if empty */
    public boolean isEmpty() {
        return numKeys == 0;
    }
    
    /**
     * Method to rehash table.
     * Allocates a new hash table that is double the size and has an odd length.
     * Reinsert each table entry in the new hash table.
     */
    private void rehash() {
        LinkedList<Entry<K,V>>[] oldTable = table;
        table = new LinkedList[oldTable.length * 2 + 1];
        numKeys = 0;
        for (LinkedList<Entry<K, V>> list : oldTable) {
            if (list != null) {
                for (Entry<K,V> entry : list) {
                    put(entry.getKey(), entry.getValue());
                    numKeys++;
                }
            }
        }
    }

    /*
     * Removes all the mapping from this map by setting every element to null.
     */
    @Override
    public void clear() {
        for (LinkedList<Entry<K,V>> list : table) {
            list = null;
        }
    }

    /*
     * Returns true if this map contains a mapping for the specified key.
     * @see java.util.Map#containsKey(java.lang.Object)
     */
    @Override
    public boolean containsKey(Object key) {
        int index = key.hashCode() % table.length;
        if (index < 0) {
            index += table.length;
        }
        if (table[index] == null) {
            return false;
        }
        for (Entry<K,V> entry : table[index]) {
            if (entry.getKey().equals(key)) {
                return true;
            }
        }
        return false;
    }

    /*
     * Returns true if this map maps a key to the specified value.
     * @see java.util.Map#containsValue(java.lang.Object)
     */
    @Override
    public boolean containsValue(Object value) {
        for (LinkedList<Entry<K,V>> list : table) {
            for (Entry<K,V> entry : list) {
                if (entry.getValue().equals(value)) {
                    return true;
                }
            }
        }
        return false;
    }

    /*
     * Returns a Set view of the mappings in this map.
     * @see java.util.Map#entrySet()
     */
    @Override
    public Set<Map.Entry<K, V>> entrySet() {
        return new EntrySet();
    }

    /*
     * Returns a Set view of the keys in this map.
     * @see java.util.Map#keySet()
     */
    @Override
    public Set<K> keySet() {
        Set<K> keySet = new HashSet<K>(size());
        for (LinkedList<Entry<K,V>> list : table) {
            for (Entry<K,V> entry : list) {
                if (entry != null) {
                    keySet.add(entry.getKey());
                }
            }
        }
        return keySet;
    }

    /*
     * The putAll operation is not supported for this map.
     * @see java.util.Map#putAll(java.util.Map)
     */
    @Override
    public void putAll(Map<? extends K, ? extends V> map) {
        throw new UnsupportedOperationException();
    }

    /*
     * Removes the mapping for a key from this map if it is present.
     * @see java.util.Map#remove(java.lang.Object)
     */
    @Override
    public V remove(Object key) {
        int index = key.hashCode() % table.length;
        if (index < 0) {
            index += table.length;
        }
        if (table[index] == null) {
            return null; // key is not in table
        }
        for (Entry<K, V> entry : table[index]) {
            if (entry.getKey().equals(key)) {
                V value = entry.getValue();
                table[index].remove(entry);
                numKeys--;
                if (table[index].isEmpty()) {
                    table[index] = null;
                }
                return value;
            }
        }
        return null;
    }

    /*
     * Returns the number of key-value mappings.
     * @see java.util.Map#size()
     */
    @Override
    public int size() {
        return numKeys;
    }

    /*
     * Returns a Collection view of the values in the map.
     * @see java.util.Map#values()
     */
    @Override
    public Collection<V> values() {
        Collection<V> values = new HashSet<V>(size());
        for (LinkedList<Entry<K,V>> list : table) {
            for (Entry<K,V> entry : list) {
                if (entry != null) {
                    values.add(entry.getValue());
                }
            }
        }
        return values;
    }
    
    /**
     * Returns a String representation of the map.
     */
    public String toString() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < table.length; i++) {
            sb.append("[" + i + "] ");
            for (Entry<K,V> entry : table[i]) {
                sb.append("-> " + entry + " ");
            }
            sb.append("\n");
        }
        return sb.toString();
    }
    
    // Inner class EntrySet
    private class EntrySet extends AbstractSet<Map.Entry<K,V>> {
        
        /** Return the size of the set. */
        @Override
        public int size() {
            return numKeys;
        }

        /** Return an iterator over the set. */
        @Override
        public Iterator<Map.Entry<K, V>> iterator() {
            return new SetIterator();
        }
    }
    
    // Inner class SetIterator
    private class SetIterator implements Iterator<Map.Entry<K,V>> {

        //Data Fields
        /** The current index of the map array */
        int index = 0;
        /** The last item returned by next() */
        Entry<K,V> lastItemReturned = null;
        /** The iterator to traverse each LinkedList in the map */
        Iterator<Entry<K,V>> iter = null;
        
        /*
         * Returns true if the set has more elements to iterate.
         * @see java.util.Iterator#hasNext()
         */
        @Override
        public boolean hasNext() {
            
            if (iter != null && iter.hasNext()) {
                return true;
            }
            do {
                index++;
                if (index >= table.length) {
                    return false;
                }
            } while (table[index] == null);
            iter = table[index].iterator();
            return iter.hasNext();
        }

        /*
         * Returns the next element in the iteration.
         * @see java.util.Iterator#next()
         */
        @Override
        public Map.Entry<K, V> next() {
            if (iter.hasNext()) {
                
                lastItemReturned = iter.next();
                return lastItemReturned;
            } else {
                throw new NoSuchElementException();
            }
        }

        /*
         * Removes the last item returned by a call to next.
         * If a call to remove is not preceded by a call to next,
         * it throws an IllegalStateException.
         * @see java.util.Iterator#remove()
         */
        @Override
        public void remove() throws IllegalStateException {
            if (lastItemReturned == null) {
                throw new IllegalStateException();
            } else {
                iter.remove();
                lastItemReturned = null;
            }
        }
    }
}