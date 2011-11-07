package com.buglabs.swarm;

import java.util.ArrayList;

//Convenience POJO instead of using params to Swarm.join, etc.
public class SwarmParticipant {
	private String apiKey;
	private String resourceID;
	private ArrayList<String> swarms;

	public SwarmParticipant() {

	}

	public void setSwarms(ArrayList<String> swarms) {
		this.swarms = swarms;
	}

	public ArrayList<String> getSwarms() {
		return swarms;
	}

	public void setResourceID(String resourceID) {
		this.resourceID = resourceID;
	}

	public String getResourceID() {
		return resourceID;
	}

	public void setApiKey(String apiKey) {
		this.apiKey = apiKey;
	}

	public String getApiKey() {
		return apiKey;
	}

}
