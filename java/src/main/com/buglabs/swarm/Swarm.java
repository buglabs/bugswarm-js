package com.buglabs.swarm;

import com.buglabs.swarm.exceptions.SwarmException;

public interface Swarm {
	void join(String[] swarms, String apiKey, Callback callback) throws SwarmException;
	void join(String swarm, String apikey, Callback callback) throws SwarmException;
	void leave(String[] swarms) throws SwarmException;
	void leave(String swarm) throws SwarmException;
	void leave() throws SwarmException; //leaves all the swarms where I have presence
	void send(String message) throws SwarmException;
}
