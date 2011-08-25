#define BUFF_SIZE 200

#include <avr/pgmspace.h>
#include <Ethernet.h>
#include "SPI.h"

#define Serialprint(format, ...) StreamPrint_progmem(Serial,PSTR(format),##__VA_ARGS__)
#define Streamprint(stream,format, ...) StreamPrint_progmem(stream,PSTR(format),##__VA_ARGS__)

byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
byte ip[] = { 192, 168, 0, 250 };
byte gateway[] = { 192, 168, 0, 3 };
//byte server[] = { 192, 168, 0, 158 };
byte server[] = { 107, 20, 250, 52 };

char line[BUFF_SIZE];
char body[128];
char apikey[] = "172a8293e12c97ae4cf7c08f6f8817ff07f9ab8a";
char swarmid[] = "fd4429681bf05c5f4e9fc5476650e5ceb740add5";
char resource[] = "deadbeeffeed";
char id[] = "theterg";

void StreamPrint_progmem(Print &out,PGM_P format,...)
{
  // program memory version of printf - copy of format string and result share a buffer
  // so as to avoid too much memory use
  char formatString[256], *ptr;
  strncpy_P( formatString, format, sizeof(formatString) ); // copy in from program mem
  // null terminate - leave last char since we might need it in worst case for result's \0
  formatString[ sizeof(formatString)-2 ]='\0';
  ptr=&formatString[ strlen(formatString)+1 ]; // our result buffer...
  va_list args;
  va_start (args,format);
  vsnprintf(ptr, sizeof(formatString)-1-strlen(formatString), formatString, args );
  va_end (args);
  formatString[ sizeof(formatString)-1 ]='\0';
  out.print(ptr);
}

Client client(server, 80);

void setup(){
  Ethernet.begin(mac, ip, gateway);
  Serial.begin(115200);
  Serialprint("Arduino Swarm demo start\n");
  activateResource();
  //Serial.print(response);
}

void loop(){

}

boolean updateResource(){
  if (!client.connected()){
    if (!client.connect())
      Serialprint("connection failed");
      return false;
  }  
  memset(body, '\0', 128);
  Streamprint(client,"POST /swarms/%s",swarmid);
  Streamprint(client,"/resources HTTP/1.1\nHost: api.bugswarm.net\nx-bugswarmapikey:%s",apikey);
  Streamprint(client,"\ncontent-type:application/json");
  Streamprint(client,"\nContent-Length: ");
  strcat(body, "{\"type\":\"producer\",\"user_id\":\"");
  strcat(body, id);
  strcat(body, "\",\"id\":\"");
  strcat(body, resource);
  strcat(body, "\"}\n");
  Streamprint(client,"%d\n\n%s\n",strlen(body),body);
  //Serialprint("waiting for response\n");
  while(!client.available()) {} //Wait until first data
  //Serialprint("reading response\n");
  do {
    if(client.available()){     //loop across all data
      clientReadLine();
      //Serialprint("%s(%d)\n",line,strcmp(line,"HTTP/1.1 "));
    }
  } while (strncmp(line,"HTTP/1.1 ",9) != 0);
  //Serialprint("\ndisconnecting...\n");
  client.stop();
  if (strncmp(line+9,"201",3) == 0){
    Serialprint("Resource added\n");
    return true;
  }
  Serialprint("ERROR adding resource: %s",line);
  return false;
}

boolean activateResource(){
  if (!client.connect()){
    Serialprint("connection failed");
    return false;
  }
  //Serialprint("connected, transmitting...\n");
  memset(body, '\0', 128);
  Streamprint(client,"POST /swarms/%s",swarmid);
  Streamprint(client,"/resources HTTP/1.1\nHost: api.bugswarm.net\nx-bugswarmapikey:%s",apikey);
  Streamprint(client,"\ncontent-type:application/json");
  Streamprint(client,"\nContent-Length: ");
  strcat(body, "{\"type\":\"producer\",\"user_id\":\"");
  strcat(body, id);
  strcat(body, "\",\"id\":\"");
  strcat(body, resource);
  strcat(body, "\"}\n");
  Streamprint(client,"%d\n\n%s\n",strlen(body),body);
  //Serialprint("waiting for response\n");
  while(!client.available()) {} //Wait until first data
  //Serialprint("reading response\n");
  do {
    if(client.available()){     //loop across all data
      clientReadLine();
      //Serialprint("%s(%d)\n",line,strcmp(line,"HTTP/1.1 "));
    }
  } while (strncmp(line,"HTTP/1.1 ",9) != 0);
  //Serialprint("\ndisconnecting...\n");
  client.stop();
  if (strncmp(line+9,"201",3) == 0){
    Serialprint("Resource added\n");
    return true;
  }
  Serialprint("ERROR adding resource: %s",line);
  return false;
}

void clientReadLine(){
  memset(line, '\0', BUFF_SIZE);
  int idx=0;
  while((idx < BUFF_SIZE)&&client.available()){
    char c = client.read();
    if (c == '\n')
      return;
    line[idx++] = c;
  }
}

