package com.buglabs.swarm.connection;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.channels.SocketChannel;
import java.util.List;

import com.buglabs.bugswarm.api.pub.ISwarmMessageHandler;
import com.buglabs.swarm.util.CircularQueue;

//TODO implement reconnection algorithm "binary exponential backoff"
//http://www.w3.org/Protocols/rfc2616/rfc2616-sec8.html#sec8.2.4

public class Connection {
	private CircularQueue<String> messageQueue;
	private SocketChannel channel;

	public Connection() {
		/** 
		 * TODO CircularQueue has an arbitrary
		 * value for now, we need to do testing and benchmarks to
		 * determine the proper value.
		 * Also we need to put the value in a properties file
		 **/
		this.messageQueue = new CircularQueue<String>(10000); 
	}

	public boolean open(String apiKey, String resourceID, List<String> swarms, ISwarmMessageHandler callback)
			throws Exception {
		channel = null;

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
		
		
		//while (conn
		channel = SocketChannel.open();
	
		boolean connected = channel.connect(socketAddress);
		
		/*
		 * READING from the connection:
		 * This thread doesn't write anything into the SocketChannel, so no params need le passing except
		 * channel and callback
		 */
		new Thread(new SwarmConnectionReader(channel, callback)).start();
		
		/*
		 * WRITING to the connection:
		 * this guy actually writes the headers, so pass the resourceID and swarms list here
		 * we also don't need to pass the callback in here, naturally, because it's responsible for writing
		 */
		new Thread(new SwarmConnectionWriter(channel, messageQueue, apiKey, resourceID, swarms)).start();
		
		return connected;
	}
	
	public void close(){
		try {
			channel.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void send(String message) {
		messageQueue.add(message);
	}
}


