package com.buglabs.swarm.connection;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.channels.SocketChannel;
import java.nio.charset.Charset;
import java.nio.charset.CharsetDecoder;

import com.buglabs.bugswarm.api.pub.ISwarmMessageHandler;

public class SwarmConnectionReader implements Runnable {
	private SocketChannel channel;
	private ISwarmMessageHandler callback;
	
	private Charset charset;
	private CharsetDecoder decoder;
	private ByteBuffer buffer;
	private CharBuffer charBuffer;
	
	public SwarmConnectionReader(SocketChannel channel, ISwarmMessageHandler callback) {
		this.channel = channel;
		this.callback = callback;
		
		this.charset = Charset.forName("UTF-8");
		this.decoder = charset.newDecoder();

		this.buffer = ByteBuffer.allocateDirect(1024);
		this.charBuffer = CharBuffer.allocate(1024);
	}
	
	@Override
	public void run() {
		try {
			while ((channel.read(buffer)) != -1) {
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

}
