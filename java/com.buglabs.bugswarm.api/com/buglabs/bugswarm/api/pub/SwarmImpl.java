package com.buglabs.bugswarm.api.pub;

import java.util.Arrays;
import java.util.List;

import com.buglabs.swarm.connection.Connection;
import com.buglabs.swarm.exceptions.SwarmException;

public class SwarmImpl implements ISwarm {
	Connection conn = new Connection();
	@Override
	public void join(List<String> swarms, String resourceID, String apiKey, ISwarmMessageHandler callback) {
		try {
			conn.open(apiKey, resourceID, swarms, callback );
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	//	public boolean open(String apiKey, String resourceID, ArrayList<String> swarms, ISwarmMessageHandler callback)

	@Override
	public void join(String swarm, String resourceID, String apikey, ISwarmMessageHandler callback) {
		join(Arrays.asList(swarm), resourceID, apikey, callback);
	}

	@Override
	/**
	 * Example JSON message: {"presence": {"to": ["234", "333"], type: "unavailable"}}
	 * @url: http://developer.bugswarm.net/participation_api.html#formats
	 */
	public void leave(List<String> swarms) {
		//TODO: PresenceMessage object -> toJson();
		//Instead of hand-building the string.
		StringBuilder presenceMessage = new StringBuilder();
		
		presenceMessage.append("{\"presence\": {\"to\": [");
		for (String swarm : swarms){
			presenceMessage.append('\"').append(swarm).append('\"').append(',');
		}
		//trailing comma
		presenceMessage.deleteCharAt(presenceMessage.length()-1);
		presenceMessage.append("], type: \"unavailable\"}}");
		conn.send(presenceMessage.toString());
		
	}

	@Override
	public void leave(String swarm) {
		leave(Arrays.asList(swarm));
	}

	@Override
	public void send(String message) throws SwarmException {
		conn.send(message);
	}

	@Override
	public void disconnect() {
		conn.close();
	}
}
