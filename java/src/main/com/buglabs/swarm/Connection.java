package com.buglabs.swarm;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.channels.SocketChannel;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.CharsetDecoder;
import java.nio.charset.CharsetEncoder;

//TODO implement reconnection algorithm "binary exponential backoff"
//http://www.w3.org/Protocols/rfc2616/rfc2616-sec8.html#sec8.2.4

public class Connection {
	private SocketChannel channel;
	private StringBuilder chunk;
	private String CRLF;
	
	private CharsetEncoder encoder;
	private CharsetDecoder decoder;
	private Charset charset;
	
	public Connection() {
		this.CRLF = "\r\n";
		this.chunk = new StringBuilder();	
		this.charset = Charset.forName("UTF-8");
		this.encoder = charset.newEncoder();
		this.decoder = charset.newDecoder();
	}
	
	protected void open(String apiKey, Callback callback) throws Exception{
		if(apiKey == null || apiKey.isEmpty()) {
			throw new Exception("You must provide an API Key");
			//throw new ApiKeyException(); //TODO
		}
		
		if(callback == null) {
			throw new Exception("You must provide a callback instance.");
			//throw new CallbackException(); //TODO
		}
		
		InetSocketAddress socketAddress = new InetSocketAddress(
				"bugswarm.net", 80); //properties file? TODO

		channel = SocketChannel.open();
		if(!channel.connect(socketAddress)){ 
			throw new IOException("Unable to connect to Swarm server.");
		}
		
		//watches socket for incoming data
		receive(callback);
		
		chunk.append("POST /stream HTTP/1.1").append(CRLF);
		chunk.append("Host: api.bugswarm.net").append(CRLF);
		chunk.append("Accept: application/json").append(CRLF);
		chunk.append("X-BugSwarmApiKey: ").append(apiKey).append(CRLF);
		chunk.append("Connection: close").append(CRLF); //switch to keep-alive when nodejs fixes https://github.com/joyent/node/issues/940
		chunk.append("User-Agent: Java Swarm Client v1.0").append(CRLF);
		chunk.append("Transfer-Encoding: chunked").append(CRLF);
		chunk.append("Content-Type: application/json ;charset=UTF-8").append(CRLF);
		chunk.append(CRLF);
	}
	
	protected int send(String message) throws IOException {
		String length = Integer.toHexString(CharBuffer.wrap(message).length());
		
		//headers and first message have to go in the same packet.
		chunk.append(length);
		chunk.append(CRLF);
		chunk.append(message);
		chunk.append(CRLF);
		
		int bytesSent = 0; 
		//TODO should we check max message size? 64kb? ejabberd has a 64kb configurable limit
		//TODO include our own framing mechanism with \n\r or \0?
		try {
			bytesSent = channel.write(encoder.encode(CharBuffer.wrap(chunk.toString())));
			chunk.delete(0, chunk.length());
		} catch (CharacterCodingException e1) {
			e1.printStackTrace();
			//TODO throws unchecked exception
		} 
		return bytesSent;
	}
	
	protected void receive(Callback callback) {
		ByteBuffer buffer = ByteBuffer.allocateDirect(2048);
		CharBuffer charBuffer = CharBuffer.allocate(2048);
		
		try {
			while ((channel.read(buffer)) != -1) {
				//TODO parse our framing to
				//send back valid and complete JSON Strings
				buffer.flip();
				decoder.decode(buffer, charBuffer, false);
				charBuffer.flip();
				
				callback.onMessage(charBuffer.toString());
				
				buffer.clear();
				charBuffer.clear();
			}
		} catch (Exception ioe) {
			ioe.printStackTrace();
			if (channel.isOpen()) {
				try {
					channel.close();
				} catch (IOException ioe2) {
					ioe2.printStackTrace();
				}
			}
		}
	}
	
	protected void close() {
	
	}
}
