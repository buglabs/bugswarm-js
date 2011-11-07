package com.buglabs.swarm.connection;

import java.io.IOException;
import java.nio.CharBuffer;
import java.nio.channels.SocketChannel;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.CharsetEncoder;
import java.util.List;

import com.buglabs.swarm.util.CircularQueue;

public class SwarmConnectionWriter implements Runnable {
	private SocketChannel channel;
	private CircularQueue<String> messageQueue;
	private String CRLF = "\r\n";
	private String apiKey;
	private CharsetEncoder encoder;
	private Charset charset;
	private final List<String> swarms;
	private final String resourceID;

	public SwarmConnectionWriter(SocketChannel channel, CircularQueue<String> messageQueue, String apiKey, String resourceID, List<String> swarms) {
		this.channel = channel;
		this.messageQueue = messageQueue;
		this.apiKey = apiKey;
		this.resourceID = resourceID;
		this.swarms = swarms;
		
		this.charset = Charset.forName("UTF-8");
		this.encoder = charset.newEncoder();
	}

	@Override
	public void run() {
		StringBuilder chunk = new StringBuilder();
		//we always POST irregardless of whether the resource is a producer or consumer.
		//we always hit /stream
		
		//here's an example url: /stream?swarm_id=61ec44aaa1483021574b63055620e24be161a609&resource_id=b013f99c9fea77cdd5f93a80ec6411f22b70e84c HTTP/1.1").append(CRLF);
		chunk.append("POST /stream?");
		for (String swarm : swarms){
			chunk.append("swarm_id=").append(swarm).append("&");
		}
		chunk.append("resource_id=").append(resourceID).append("HTTP/1.1").append(CRLF);

		chunk.append("Host: api.bugswarm.net").append(CRLF);
		chunk.append("Accept: application/json").append(CRLF);
		chunk.append("X-BugSwarmApiKey: ").append(apiKey).append(CRLF);
		
		// switch to keep-alive once nodejs fixes https://github.com/joyent/node/issues/940
		chunk.append("Connection: close").append(CRLF); 
		chunk.append("User-Agent: Java Swarm Client v0.3").append(CRLF);
		chunk.append("Transfer-Encoding: chunked").append(CRLF);
		chunk.append("Content-Type: application/json ;charset=UTF-8").append(CRLF);
		chunk.append(CRLF);
		
		try {
			while (true) {
				while (!messageQueue.isEmpty()) {
					send(channel, chunk, messageQueue.remove());
				}

				/**
				 * TODO We have to make sure this is not going
				 * to drain the battery.
				 **/
				Thread.sleep(100);
			}
		} catch (InterruptedException ie) {
			ie.printStackTrace();
		} catch (IOException ioe) {
			ioe.printStackTrace();
		}
	}
	
	private int send(SocketChannel channel, StringBuilder chunk, String message) throws IOException {
		String length = Integer.toHexString(CharBuffer.wrap(message).length());

		// headers and first message have to go in the same packet.
		chunk.append(length);
		chunk.append(CRLF);
		chunk.append(message);
		chunk.append(CRLF);

		int bytesSent = 0;
		// TODO should we check max message size? 64kb? ejabberd has a 64kb
		// configurable limit
		// TODO include our own framing mechanism with \n\r or \0?
		try {
			CharBuffer buffer = CharBuffer.wrap(chunk.toString());
			//System.out.println("Sending " + chunk.toString());
			while (buffer.hasRemaining()) {
				bytesSent += channel.write(encoder.encode(buffer));
			}
			chunk.delete(0, chunk.length());
		} catch (CharacterCodingException e1) {
			e1.printStackTrace();
			// TODO it should throw an Swarm unchecked exception
		}
		return bytesSent;
	}
}
