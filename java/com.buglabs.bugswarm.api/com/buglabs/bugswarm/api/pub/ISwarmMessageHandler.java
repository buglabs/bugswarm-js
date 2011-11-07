package com.buglabs.bugswarm.api.pub;

/**
 * Interface that end users should implement
 */
public interface ISwarmMessageHandler {
	void onMessage(String message); //ideally this will be a JSONObject (simple json) or using http://wiki.fasterxml.com/JacksonDataBinding
}
