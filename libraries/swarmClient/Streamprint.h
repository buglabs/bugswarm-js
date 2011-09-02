#ifndef Streamprint_h
#define Streamprint_h

#include "WProgram.h"
#include <avr/pgmspace.h>

void StreamPrint_progmem(Print &out,PGM_P format,...);

#define Serialprint(format, ...) StreamPrint_progmem(Serial,PSTR(format),##__VA_ARGS__)
#define Streamprint(stream,format, ...) StreamPrint_progmem(stream,PSTR(format),##__VA_ARGS__)

#endif
