package com.buglabs.bugswarm.api.pub;

import java.util.List;

import com.buglabs.swarm.exceptions.SwarmException;

public interface ISwarm {
	/**
	 * @author jconnolly@buglabs.net
	 * @param swarm
	 * @throws SwarmException
	 * @url http://developer.bugswarm.net/participation_api.html#using-the-streaming-api
	 * 
	 * The swarm
	 */
	void leave(String swarm) throws SwarmException;
	void send(String message) throws SwarmException;
	void join(List<String> swarms, String resourceID, String apiKey,
			ISwarmMessageHandler callback);
	void join(String swarm, String resourceID, String apikey,
			ISwarmMessageHandler callback);
	void leave(List<String> swarms);
	void disconnect();
}
