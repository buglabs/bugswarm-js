package com.buglabs.swarm;

import com.buglabs.swarm.connection.Connection;
import com.buglabs.swarm.connection.Callback;

public class ConnectionTest {
	public static void main(String[] args) {
		final Connection conn = new Connection();
		String apiKey = "984fe0a78ab3523dee712011b83fcc8d5df753f1";
		
		class CallbackImpl implements Callback {	
			@Override
			public void onMessage(String message) {
				System.out.println("Received: " + message);
			}

			@Override
			public void onConnection() {
				System.out.println("Sending presence to a Swarm");
				conn.send("{\"presence\":{\"to\":\"db438ef12c1c79f97a7d13fdddc12e3fe3245440@swarms.bugswarm.net/camilodevice\"}}");
			}
		}
		
		Callback callback = new CallbackImpl();
		
		try {
			conn.open(apiKey, callback);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
