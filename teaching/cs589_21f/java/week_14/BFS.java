package Week_15;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.Vector;

public class BFS{

	public void add_edge(ArrayList<ArrayList<Integer>> adj, int src, int dest) 
	{ 
		adj.get(src).add(dest); 
		adj.get(dest).add(src); 
	} 

	// a queue to maintain queue of vertices whose 
    // adjacency list is to be scanned as per normal 
    // DFS algorithm 
	public boolean BFS(ArrayList<ArrayList<Integer>> adj, int src, int dest, int v, int pred[], int dist[]) 
	{ 
		LinkedList<Integer> queue = new LinkedList<Integer>();
		
		// boolean array visited[] which stores the 
	    // information whether ith vertex is reached 
	    // at least once in the Breadth first search 
		boolean[] visited = new boolean[v];
	
	    // initially all vertices are unvisited 
	    // so v[i] for all i is false 
	    // and as no path is yet constructed 
	    // dist[i] for all i set to infinity
		for (int i = 0; i < v; i++) { 
			visited[i] = false; 
			dist[i] = Integer.MAX_VALUE; 
			pred[i] = -1; 
		} 

		// now source is first to be visited and 
	    // distance from source to itself should be 0 
		visited[src] = true; 
		dist[src] = 0; 
		queue.add(src); 
	
		// standard BFS algorithm 
		while (!queue.isEmpty()) { 
			int u = queue.peek(); 
			queue.poll(); 
			for (int i = 0; i < adj.get(u).size(); i++) { 
				int ith_item = adj.get(u).get(i);
				if (visited[ith_item] == false) { 
					visited[ith_item] = true; 
					dist[ith_item] = dist[u] + 1; 
					pred[ith_item] = u; 
					queue.add(ith_item); 
	
					if (ith_item == dest) 
					return true; 
				} 
			} 
		} 
	
		return false; 
	} 

	// utility function to print the shortest distance  
	// between source vertex and destination vertex 
	public void printShortestDistance(ArrayList<ArrayList<Integer>> adj, int s, 
										int dest, int v) 
	{ 
		// predecessor[i] array stores predecessor of 
		// i and distance array stores distance of i 
		// from s 
		int[] pred = new int[v];
		int[] dist = new int[v]; 
	
		if (BFS(adj, s, dest, v, pred, dist) == false) 
		{ 
			System.out.println("Given source and destination are not connected"); 
			return; 
		} 
	
		// vector path stores the shortest path 
		ArrayList<Integer> path = new ArrayList<Integer>(); 
		int crawl = dest; 
		path.add(crawl); 
		while (pred[crawl] != -1) { 
			path.add(pred[crawl]); 
			crawl = pred[crawl]; 
		} 
	
		System.out.println("Shortest path length is : " + dist[dest]); 
	
		System.out.println("\nPath is::"); 
		
		for (int i = path.size() - 1; i >= 0; i--) 
			System.out.print(path.get(i) + " "); 
	} 

//Driver program to test above functions 
	public static void main(String[] args) 
	{ 
		BFS bfs = new BFS();
		int v = 8; 
	
		// array of vectors is used to store the graph 
		// in the form of an adjacency list 
		ArrayList<ArrayList<Integer>> adj = new ArrayList<ArrayList<Integer>>();
		
		for (int i = 0; i < v; i ++) {
			adj.add(new ArrayList<Integer>());
		}
	
		// Creating graph given in the above diagram. 
		// add_edge function takes adjacency list, source 
		// and destination vertex as argument and forms 
		// an edge between them. 
		bfs.add_edge(adj, 0, 1); 
		bfs.add_edge(adj, 0, 3); 
		bfs.add_edge(adj, 1, 2); 
		bfs.add_edge(adj, 3, 4); 
		bfs.add_edge(adj, 3, 7); 
		bfs.add_edge(adj, 4, 5); 
		bfs.add_edge(adj, 4, 6); 
		bfs.add_edge(adj, 4, 7); 
		bfs.add_edge(adj, 5, 6); 
		bfs.add_edge(adj, 6, 7); 
		int source = 0, dest = 7; 
		bfs.printShortestDistance(adj, source, dest, v); 
	} 
}

