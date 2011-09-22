package com.buglabs.swarm.connection;

import java.net.InetSocketAddress;
import java.nio.channels.SocketChannel;

import com.buglabs.swarm.Callback;
import com.buglabs.swarm.util.CircularQueue;

//TODO implement reconnection algorithm "binary exponential backoff"
//http://www.w3.org/Protocols/rfc2616/rfc2616-sec8.html#sec8.2.4

public class Connection {
	private CircularQueue<String> messageQueue;

	public Connection() {
		/** 
		 * TODO CircularQueue has an arbitrary
		 * value for now, we need to do testing and benchmarks to
		 * determine the proper value.
		 * Also we need to put the value in a properties file
		 **/
		this.messageQueue = new CircularQueue<String>(10000); 
	}

	public boolean open(String apiKey, Callback callback)
			throws Exception {
		SocketChannel channel = null;

		if (apiKey == null || apiKey.isEmpty()) {
			throw new Exception("You must provide an API Key");
			// throw new ApiKeyException(); //TODO
		}

		if (callback == null) {
			throw new Exception("You must provide a callback instance.");
			// throw new CallbackException(); //TODO
		}

		InetSocketAddress socketAddress = new InetSocketAddress(
				"api.bugswarm.net", 80); //TODO put this conf in a properties file

		channel = SocketChannel.open();
	
		boolean connected = channel.connect(socketAddress);
		
		new Thread(new Consumer(channel, callback)).start();
		new Thread(new Producer(channel, messageQueue, apiKey)).start();
		
		return connected;
	}

	public void send(String message) {
		messageQueue.add(message);
	}
}


