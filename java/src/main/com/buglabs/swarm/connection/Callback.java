package com.buglabs.swarm.connection;

public interface Callback {
	void onConnection();
	void onMessage(String message);
}
