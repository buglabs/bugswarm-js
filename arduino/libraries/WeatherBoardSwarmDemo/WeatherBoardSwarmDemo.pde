#include <avr/pgmspace.h>
#include <Streamprint.h>
#include <SPI.h>
#include <Ethernet.h>
#include <swarmClient.h>


byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
byte ip[] = { 192, 168, 0, 250 };
byte gateway[] = { 192, 168, 0, 3 };
//byte server[] = { 192, 168, 0, 158 };
byte server[] = { 107, 20, 250, 52 };

char line[200];
char data[5][10];

PROGMEM prog_char apikey[] = "172a8293e12c97ae4cf7c08f6f8817ff07f9ab8a";
PROGMEM prog_char swarmid[] = "fd4429681bf05c5f4e9fc5476650e5ceb740add5";
PROGMEM prog_char resource[] = "tergproduce";
PROGMEM prog_char id[] = "theterg";

swarmClient swarm(server, apikey, swarmid, resource, id);

void setup(){ 
  Serial.begin(9600);
  Serialprint("Starting...");
  Ethernet.begin(mac,ip,gateway);
  Serialprint("Done!\n");
  while (!swarm.startProducing("test")) {Serialprint("p");}
}

void loop(){
  readline(0);
  parseline();
  swarm.produce(line);
}

void readline(char echo){
  int i=0; char c = 0x0;
  memset(line,'\0',BUFF_SIZE);
  while((i < BUFF_SIZE-1)){
    while (Serial.available() < 1) {}  //Block until character is available
    c = Serial.read();
    if (echo)
      Serial.print(c,BYTE);
    if (c == '\r')
      continue;
    //if (c == '\n')
    if ((c == '\n')||(c == '\r')||(c == 'M'))
      break;
    line[i++] = c;
  }
}

void parseline(){
  int lineidx = 2;
  for (int i=0;i<5;i++){
    int dataidx = 0;
    memset(data[i], '\0', 10);
    char c = line[lineidx++];
    while(c != ','){
      data[i][dataidx++] = c; 
      c = line[lineidx++];
    }
  }
  memset(line, '\0', BUFF_SIZE);
  sprintf(line, "{\"temp\":\"%s\",\"humidity\":\"%s\",\"dewpoint\":\"%s\",\"pressure\":\"%s\",\"light\":\"%s\"}",
    data[0],data[1],data[2],data[3],data[4]);
}
