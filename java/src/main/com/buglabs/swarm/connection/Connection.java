package com.buglabs.swarm.connection;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.SocketChannel;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.CharsetDecoder;
import java.nio.charset.CharsetEncoder;
import java.util.Iterator;
import java.util.Set;

import com.buglabs.swarm.util.CircularQueue;

//TODO implement reconnection algorithm "binary exponential backoff"
//http://www.w3.org/Protocols/rfc2616/rfc2616-sec8.html#sec8.2.4

public class Connection {
	private StringBuilder chunk;
	private String CRLF;

	private CharsetEncoder encoder;
	private CharsetDecoder decoder;
	private Charset charset;

	private CircularQueue<String> messageQueue;
	private Callback callback;

	public Connection() {
		this.CRLF = "\r\n";
		this.chunk = new StringBuilder();
		this.charset = Charset.forName("UTF-8");
		this.encoder = charset.newEncoder();
		this.decoder = charset.newDecoder();
		this.messageQueue = new CircularQueue<String>(10000); // TODO arbitrary
																// value, we
																// need to do
																// testing and
																// benchmarks to
																// determine the
																// fair value
	}

	public void open(final String apiKey, Callback callback)
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

		this.callback = callback;

		InetSocketAddress socketAddress = new InetSocketAddress(
				"stream.bugswarm.net", 80); // properties file? TODO

		channel = SocketChannel.open();
		channel.configureBlocking(false);

		final Selector selector = Selector.open();
		channel.register(selector, SelectionKey.OP_CONNECT
				| SelectionKey.OP_READ | SelectionKey.OP_WRITE);
		channel.connect(socketAddress);

		//starts to listen for events
		select(selector, apiKey);
	}

	private void select(final Selector selector, final String apiKey) {
		new Thread() {
			public void run() {
				try {
					while (selector.select() > 0) {
						Set<SelectionKey> readyKeys = selector.selectedKeys();
						Iterator<SelectionKey> iterator = readyKeys.iterator();

						while (iterator.hasNext()) {
							SelectionKey key = (SelectionKey) iterator.next();
							SocketChannel keyChannel = (SocketChannel) key
									.channel();
							iterator.remove();

							if (key.isConnectable()) {
								if (keyChannel.isConnectionPending()) {
									keyChannel.finishConnect();
								}

								callback.onConnection();
								/**
								 * Prepares the request that is going to be sent
								 * along with the first message.
								 */
								prepareRequest(apiKey);
							} else if (key.isReadable()) {
								receive(keyChannel);
							} else if (key.isWritable()) {
								while (!messageQueue.isEmpty()) {
									System.out.println("Dequeuing message");
									send(keyChannel, messageQueue.remove());
								}
							}

						}
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}.start();
	}

	private void prepareRequest(String apiKey) {
		chunk.append("POST /stream HTTP/1.1").append(CRLF);
		chunk.append("Host: api.bugswarm.net").append(CRLF);
		chunk.append("Accept: application/json").append(CRLF);
		chunk.append("X-BugSwarmApiKey: ").append(apiKey).append(CRLF);
		chunk.append("Connection: close").append(CRLF); // switch to keep-alive
														// once nodejs fixes
														// https://github.com/joyent/node/issues/940
		chunk.append("User-Agent: Java Swarm Client v1.0").append(CRLF);
		chunk.append("Transfer-Encoding: chunked").append(CRLF);
		chunk.append("Content-Type: application/json ;charset=UTF-8").append(CRLF);
		chunk.append(CRLF);
	}

	public void send(String message) {
		messageQueue.add(message);
	}

	private int send(SocketChannel channel, String message) throws IOException {
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
			while (buffer.hasRemaining()) {
				//System.out.println("Sending " + chunk.toString());
				bytesSent += channel.write(encoder.encode(buffer));
			}
			chunk.delete(0, chunk.length());
		} catch (CharacterCodingException e1) {
			e1.printStackTrace();
			// TODO it should throw an Swarm unchecked exception
		}
		return bytesSent;
	}

	private void receive(SocketChannel channel) {
		ByteBuffer buffer = ByteBuffer.allocateDirect(1024);
		CharBuffer charBuffer = CharBuffer.allocate(1024);

		try {
			channel.read(buffer);
			buffer.flip();
			decoder.decode(buffer, charBuffer, false);
			charBuffer.flip();
			// TODO parse our framing to
			// send back valid and complete JSON Strings
			callback.onMessage(charBuffer.toString());

			buffer.clear();
			charBuffer.clear();
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
