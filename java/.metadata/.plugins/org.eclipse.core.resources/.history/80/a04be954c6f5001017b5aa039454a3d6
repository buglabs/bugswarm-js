package com.buglabs.swarm;

import com.buglabs.swarm.connection.Connection;

public class ConnectionTest {
	public static void main(String[] args) {
		Connection conn = new Connection();
		String apiKey = "984fe0a78ab3523dee712011b83fcc8d5df753f1";
		
		class CallbackImpl implements Callback {	
			@Override
			public void onMessage(Object message) {
				System.out.println("Received: " + message);
			}
		}
		
		Callback callback = new CallbackImpl();
		
		try {
			conn.open(apiKey, callback);
			conn.send("{\"presence\":{\"to\":\"db438ef12c1c79f97a7d13fdddc12e3fe3245440@swarms.bugswarm.net/camilodevice\"}}");
			while(true) {
				String feed = "{\"message\":{\"to\":\"db438ef12c1c79f97a7d13fdddc12e3fe3245440@swarms.bugswarm.net\",\"type\":\"groupchat\",\"body\":{ \"$t\": \"test\"}}}";
				conn.send(feed);
				Thread.sleep(1000);
			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
