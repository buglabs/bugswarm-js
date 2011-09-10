package com.buglabs.swarm;

public interface Swarm {
	void join(String[] swarms, String apiKey, Callback callback);
	void join(String swarm, String apikey, Callback callback);
	void leave(String[] swarms);
	void leave(String swarm);
	void leave(); //leaves all the swarms where I have presence
}
