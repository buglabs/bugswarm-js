package com.buglabs.swarm;

import java.util.Map;

import org.hyperic.sigar.CpuInfo;
import org.hyperic.sigar.Sigar;

import com.buglabs.swarm.connection.Connection;

public class ConnectionTest {
	private static Sigar sigar;

	public static void main(String[] args) {
		Connection conn = new Connection();
		String apiKey = "9e6e99e5303c6675cd1eaedfed50807d35d611e9"; //participation key
		String resourceId = "a5857a23eb95fe9b78a9735d788c018d5d792e2e";
		String swarmID = "5fc95142592ef73ecf14f2e703b7c12382b7506b"; 
		
		sigar = new Sigar();
		
		
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
				StringBuilder message = new StringBuilder();
				message.append("{\"message\": {\"to\": [\""+ swarmID + "\"],\"payload\":{");
				
				
				CpuInfo info = new CpuInfo();
				
				
				Map <String, String> map = info.toMap();
				for (Map.Entry<String, String> entry : map.entrySet())
				{
				    message.append("\""+entry.getKey()+"\":\""+ entry.getValue()+"\",");
				    
				}
				

				message.append("}}}");
				conn.send(message.toString());
				Thread.sleep(5000);
			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	
}
