#include "WProgram.h"
#include "swarmClient.h"
#include <Streamprint.h>
#include <cppfix.h>

swarmClient::swarmClient(byte* server, PGM_P api, PGM_P swarm, PGM_P res, PGM_P userid) {
   serv = server;
   client = new Client(serv, 80);
   apikey = api;
   swarmid = swarm;
   resource = res;
   id = userid;
}

bool swarmClient::produce(char * data){
   if (!client->connected()){
      Serialprint("Socket closed - cant produce\n");
      return false;
   }
   Serialprint("%x\r\n%s\r\n",strlen(data),data);
   Streamprint(*client,"%x\r\n%s\r\n",strlen(data),data);
   return true;
}

bool swarmClient::startProducing(char * feed){
   if (!openSocket())
      return false;   
   memset(scratch, '\0', 80);
   strcpy_P(scratch, resource);
   Streamprint(*client,"PUT /resources/%s",scratch);
   memset(scratch, '\0', 80);
   strcpy_P(scratch, swarmid);
   Streamprint(*client, "/feeds/%s?swarm_id=%s HTTP/1.1\n",feed,scratch);
   appendHost();
   appendAPIKey();
   appendChunkedTransfer();
   endHeaders();
   
   if (!readUntilCode("200",true)){
      Serialprint("Unable open producer socket");
      client->stop();
      return false;
   }
   delay(2000);
   return true;
}

bool swarmClient::addResource(){
   if (!openSocket())
      return false;   
   memset(scratch, '\0', 80);
   strcpy_P(scratch, swarmid);
   Streamprint(*client,"POST /swarms/%s/resources HTTP/1.1\n",scratch);
   appendHost();
   appendAPIKey();
   appendContentTypeJSON();
   memset(line, '\0', BUFF_SIZE);
   strcat(line, "{\"type\":\"producer\",\"user_id\":\"");
   strcat_P(line, id);
   strcat(line, "\",\"resource\":\"");
   strcat_P(line, resource);   
   strcat(line, "\"}");
   appendContentLength(strlen(line));
   endHeaders();
   Streamprint(*client,"%s\n",line);

   if (!readUntilCode("201",false)){
      Serialprint("Unable to add resource to swarm");
      return false;
   }
   return true;
}

bool swarmClient::getSwarms(){
   if (!openSocket())
      return false;
   Streamprint(*client,"GET /swarms HTTP/1.1\n");
   appendHost();
   appendAPIKey();
   endHeaders();

   if (!readUntilCode("200",false)){
      Serialprint("Unable to retrieve swarms");
      return false;
   }
   return true;
}

bool swarmClient::readUntilCode(char * code, bool stayOpen){
   Serialprint("waiting for response\n");
   while(!client->available()) {} //Wait until first data
   //Serialprint("reading response\n");
   do {
      if(client->available()){     //loop across all data
         clientReadLine();
         Serialprint("%s\n",line);
      }
   } while (strncmp(line,"HTTP/1.1 ",9) != 0);
   if (!stayOpen)
      client->stop();
   if (strncmp(line+9,code,strlen(code)) == 0){
      return true;
   }
   Serialprint("Unexpected code: %s",line);
   return false;
}

bool swarmClient::openSocket(){
   if (!client->connected()){
      if (!client->connect()){
         Serialprint("connection failed");
         return false;
      }
   }
   //Serialprint("Connected");
   return true;
}

void swarmClient::appendAPIKey(){
   memset(scratch, '\0', 80);
   strcpy_P(scratch, apikey);
   Streamprint(*client,"x-bugswarmapikey:%s\n",scratch);
}

void swarmClient::clientReadLine(){
  memset(line, '\0', BUFF_SIZE);
  int idx=0;
  while((idx < BUFF_SIZE)&&client->available()){
    char c = client->read();
    if (c == '\n')
      return;
    line[idx++] = c;
  }
}
