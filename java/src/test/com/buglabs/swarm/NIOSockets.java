package com.buglabs.swarm;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.channels.SocketChannel;
import java.nio.charset.Charset;
import java.nio.charset.CharsetDecoder;
import java.nio.charset.CharsetEncoder;

public class NIOSockets {
	public static void main(String[] args) throws Exception {

		InetSocketAddress socketAddress = new InetSocketAddress(
				"api.bugswarm.net", 80);

		SocketChannel channel = SocketChannel.open();
		if(!channel.connect(socketAddress)){
			throw new IOException("Unable to make the socket connection.");
		}

		new Thread(new SwarmProducer(channel)).start();
		new Thread( new SwarmConsumer(channel)).start();
	}

	static class SwarmProducer implements Runnable {
		private SocketChannel channel;
		private CharsetEncoder encoder;
		private Charset charset;

		public SwarmProducer(SocketChannel channel) {
			this.channel = channel;

			this.charset = Charset.forName("UTF-8");
			this.encoder = charset.newEncoder();
		}

		@Override
		public void run() {
			String CRLF = "\r\n";

			StringBuilder sb = new StringBuilder();
			sb.append("POST /stream HTTP/1.1").append(CRLF);
			sb.append("Host: api.bugswarm.net").append(CRLF);
			sb.append("Accept: application/json").append(CRLF);
			sb.append("X-BugSwarmApiKey: 984fe0a78ab3523dee712011b83fcc8d5df753f1").append(CRLF);
			sb.append("Connection: close").append(CRLF);
			sb.append("User-Agent: Java Swarm Client v1.0").append(CRLF);
			sb.append("Transfer-Encoding: chunked").append(CRLF);
			sb.append("Content-Type: application/json ;charset=UTF-8").append(CRLF);
			sb.append(CRLF);


			try {
				//System.out.println("Sent: \n" + sb.toString());
				//channel.write(encoder.encode(CharBuffer.wrap(sb.toString())));
				//channel.write(ByteBuffer.wrap(sb.toString().getBytes()));

				//presence chunk
				String join = "{\"presence\":{\"to\":\"db438ef12c1c79f97a7d13fdddc12e3fe3245440@swarms.bugswarm.net/camilodevice\"}}";
				String length = Integer.toHexString(CharBuffer.wrap(join).length());

				//headers and first chunk must go in the same packet.
				sb.append(length);
				sb.append(CRLF);
				sb.append(join);
				sb.append(CRLF);
				System.out.println(sb.toString());

				channel.write(encoder.encode(CharBuffer.wrap(sb.toString())));
				//channel.write(ByteBuffer.wrap(chunk.toString().getBytes()));

				//message chunk
				String feed = "{\"message\":{\"to\":\"db438ef12c1c79f97a7d13fdddc12e3fe3245440@swarms.bugswarm.net\",\"type\":\"groupchat\",\"body\":{ \"$t\": \"{\"feed\":\"mpg\"}\"}}}";
				String msglength = Integer.toHexString(CharBuffer.wrap(feed).length());

				StringBuilder chunk = new StringBuilder();
				chunk.append(msglength);
				chunk.append(CRLF);
				chunk.append(feed);
				chunk.append(CRLF);
				//System.out.println(chunk2.toString());

				String msgChunk = chunk.toString();
				while(true) {
					//channel.write(encoder.encode(CharBuffer.wrap(msgChunk)));
					//channel.write(ByteBuffer.wrap(msgChunk.getBytes()));
					//System.out.println(msgChunk);
					Thread.sleep(5000);
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

	static class SwarmConsumer implements Runnable {
		private Charset charset;
		private CharsetDecoder decoder;
		private SocketChannel channel;
		private ByteBuffer buffer;
		private CharBuffer charBuffer;

		public SwarmConsumer(SocketChannel channel) {
			this.channel = channel;

			this.charset = Charset.forName("UTF-8");
			this.decoder = charset.newDecoder();

			this.buffer = ByteBuffer.allocateDirect(2048);
			this.charBuffer = CharBuffer.allocate(2048);
		}

		@Override
		public void run() {
			try {
				if(!channel.isConnected()) {
					throw new Exception("Socket not connected");
				}

				while ((channel.read(buffer)) != -1) {
					buffer.flip();
					decoder.decode(buffer, charBuffer, false);
					charBuffer.flip();
					System.out.println(charBuffer);
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
}