#ifndef swarmClient_h
#define swarmClient_h

#define BUFF_SIZE 200

#include "WProgram.h"
#include <Ethernet.h>
#include <avr/pgmspace.h>
#include <Streamprint.h>

class swarmClient{
   Client* client;
   byte* serv;
   PGM_P apikey;
   PGM_P swarmid;
   PGM_P resource;
   PGM_P id;
   char scratch[80];
   char line[BUFF_SIZE];

   public:
      swarmClient(byte* server, PGM_P api, PGM_P swarm, PGM_P res, PGM_P userid);
      bool getSwarms();
      bool addResource();
      bool startProducing(char * feed);
      bool produce(char * data);
   private:
      void clientReadLine();
      bool openSocket();
      void appendAPIKey();
      bool readUntilCode(char * code,bool stayOpen);
      inline void appendHost(){
         Streamprint(*client,"Host: api.bugswarm.net\n");
      };
      inline void appendContentTypeJSON(){
         Streamprint(*client,"Content-Type: application/json\n");
      };
      inline void appendContentLength(int len){
         Streamprint(*client,"Content-Length: %d\n",len);
      };
      inline void appendChunkedTransfer(){
         Streamprint(*client,"Transfer-Encoding: chunked\n");
      };
      inline void endHeaders(){ Streamprint(*client,"\n");};
      
};

#endif
