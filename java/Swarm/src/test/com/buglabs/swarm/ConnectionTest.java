package com.buglabs.swarm;

import com.buglabs.swarm.connection.Connection;

public class ConnectionTest {
	public static void main(String[] args) {
		Connection conn = new Connection();
		String apiKey = "762aa1740d2bb21923abd5bd54a272cd1031f476"; //participation key
		String resourceId = "b013f99c9fea77cdd5f93a80ec6411f22b70e84c";
		
		class CallbackImpl implements Callback {
			@Override
			public void onMessage(Object message) {
				System.out.println("Received: " + message);
			}
		}
		
		Callback callback = new CallbackImpl();
		//MyShutdown sh = new MyShutdown();
		try {
			//Runtime.getRuntime().addShutdownHook(sh);
			
			conn.open(apiKey, callback);
			while(true) {
				String feed = "{\"message\": {\"to\": [\"61ec44aaa1483021574b63055620e24be161a609\"],\"payload\":{ \"$t\": \"test\"}}}";
				conn.send(feed);
				Thread.sleep(5000);
			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	
}