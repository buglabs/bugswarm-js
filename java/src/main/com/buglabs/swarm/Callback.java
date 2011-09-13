package com.buglabs.swarm;

/**
 * Interface that end users should implement
 */
public interface Callback {
	void onMessage(Object object); //ideally this will be a JSONObject (simple json) or using http://wiki.fasterxml.com/JacksonDataBinding
}
