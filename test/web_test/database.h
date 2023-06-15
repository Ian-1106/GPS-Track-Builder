unsigned char isConnect[] = { 0x08, 0x00,	0x31,	0x01,	0x59,	0x10};
unsigned char allPathHead[] = { 0x08,	0x00,	0x31,	0x04,	0x00,	0x10,	0x00,	0x20,	0x05,	0x59,	0x10};
unsigned char allPathInfo[][39] = {
  { 0x08,  0x00,  0x31, 0x05, 0x01, 0x66, 0x04, 0xF6, 0x07, 0x2D, 0x9C, 0xC0, 0x01, 0x66, 0x03, 0xD4, 0x07 ,0x2D, 0x9C, 0x40, 0x01, 0x66, 0x03, 0xD4, 0x07, 0x2D, 0x9C, 0x3F, 0x01, 0x66, 0x03, 0x68, 0x07, 0x2D, 0x9B, 0x39, 0x2C, 0x59, 0x10 },
  { 0x08,  0x00,  0x31, 0x05, 0x01, 0x66, 0x03, 0x67, 0x07, 0x2D, 0x9B, 0x38, 0x01, 0x66, 0x03, 0x5E, 0x07 ,0x2D, 0x99, 0xC1, 0x01, 0x66, 0x03, 0x5D, 0x07, 0x2D, 0x99, 0xC1, 0x01, 0x66, 0x03, 0x85, 0x07, 0x2D, 0x98, 0x24, 0xCA, 0x59, 0x10 },
  { 0x08,  0x00,  0x31, 0x05, 0x01, 0x66, 0x03, 0x85, 0x07, 0x2D, 0x98, 0x24, 0x01, 0x66, 0x03, 0xD4, 0x07 ,0x2D, 0x96, 0xF8, 0x01, 0x66, 0x03, 0xD3, 0x07, 0x2D, 0x96, 0xF7, 0x01, 0x66, 0x04, 0x80, 0x07, 0x2D, 0x95, 0xE1, 0xF6, 0x59, 0x10 },
  { 0x08,  0x00,  0x31, 0x05, 0x01, 0x66, 0x04, 0x80, 0x07, 0x2D, 0x95, 0xE1, 0x01, 0x66, 0x05, 0x85, 0x07 ,0x2D, 0x95, 0x1B, 0x01, 0x66, 0x05, 0x85, 0x07, 0x2D, 0x95, 0x1A, 0x01, 0x66, 0x06, 0x99, 0x07, 0x2D, 0x94, 0x5F, 0x91, 0x59, 0x10 },
  { 0x08,  0x00,  0x31, 0x05, 0x01, 0x66, 0x06, 0x98, 0x07, 0x2D, 0x94, 0x5E, 0x01, 0x66, 0x07, 0x7B, 0x07 ,0x2D, 0x94, 0x8F, 0x01, 0x66, 0x07, 0x7B, 0x07, 0x2D, 0x94, 0x8F, 0x01, 0x66, 0x08, 0x85, 0x07, 0x2D, 0x94, 0xF5, 0x8C, 0x59, 0x10 },
  { 0x08,  0x00,  0x31, 0x05, 0x01, 0x66, 0x08, 0x85, 0x07, 0x2D, 0x94, 0xF5, 0x01, 0x66, 0x09, 0x40, 0x07 ,0x2D, 0x95, 0xA1, 0x01, 0x66, 0x09, 0x3F, 0x07, 0x2D, 0x95, 0xA0, 0x01, 0x66, 0x09, 0x84, 0x07, 0x2D, 0x96, 0x8D, 0x30, 0x59, 0x10 },
  { 0x08,  0x00,  0x31, 0x05, 0x01, 0x66, 0x09, 0x84, 0x07, 0x2D, 0x96, 0x8C, 0x01, 0x66, 0x09, 0xF1, 0x07 ,0x2D, 0x98, 0x1F, 0x01, 0x66, 0x09, 0xF0, 0x07, 0x2D, 0x98, 0x1E, 0x01, 0x66, 0x09, 0xD3, 0x07, 0x2D, 0x98, 0xF0, 0x11, 0x59, 0x10 },
  { 0x08,  0x00,  0x31, 0x05, 0x01, 0x66, 0x09, 0xD3, 0x07, 0x2D, 0x98, 0xF0, 0x01, 0x66, 0x09, 0x31, 0x07 ,0x2D, 0x99, 0xD2, 0x01, 0x66, 0x09, 0x30, 0x07, 0x2D, 0x99, 0xD1, 0x01, 0x66, 0x09, 0x09, 0x07, 0x2D, 0x9A, 0x42, 0x5C, 0x59, 0x10 }
};
unsigned char allPathOk[] = { 0x08,	0x00,	0x31,	0x06,	0x59,	0x10 };
unsigned char offsetHead[] = { 0x08,	0x00,	0x31,	0x07,	0x2A,	0x59,	0x10 };
unsigned char offsetInfo[][49] = {
  { 0x08, 0x00, 0x31, 0x08, 0x01, 0x66, 0x08, 0x43, 0x07, 0x2D, 0x98, 0x1B, 0x01, 0x66, 0x08, 0xD9, 0x07, 0x2D, 0x97, 0x40, 0x01, 0x66, 0x07, 0x8B, 0x07, 0x2D, 0x96, 0x11, 0x11, 0x00, 0x00, 0x03, 0xF5, 0x1D, 0x01, 0xE3, 0x00, 0xDB, 0x01, 0x17, 0x01, 0x32, 0x02, 0x3B, 0x00, 0xF9, 0x97, 0x59, 0x10 },
  { 0x08, 0x00, 0x31, 0x08, 0x01, 0x66, 0x08, 0x43, 0x07, 0x2D, 0x98, 0x1D, 0x01, 0x66, 0x08, 0xD9, 0x07, 0x2D, 0x97, 0x40, 0x01, 0x66, 0x07, 0x8B, 0x07, 0x2D, 0x96, 0x11, 0x11, 0x00, 0x00, 0x04, 0xF5, 0x0E, 0x01, 0xE3, 0x00, 0xDB, 0x01, 0x18, 0x01, 0x32, 0x02, 0x3C, 0x00, 0xF9, 0x8D, 0x59, 0x10 },
  { 0x08, 0x00, 0x31, 0x08, 0x01, 0x66, 0x08, 0x41, 0x07, 0x2D, 0x98, 0x1D, 0x01, 0x66, 0x08, 0xD9, 0x07, 0x2D, 0x97, 0x40, 0x01, 0x66, 0x07, 0x8B, 0x07, 0x2D, 0x96, 0x11, 0x11, 0x00, 0x00, 0x03, 0xF5, 0x00, 0x01, 0xE3, 0x00, 0xDB, 0x01, 0x1A, 0x01, 0x32, 0x02, 0x3C, 0x00, 0xF9, 0x84, 0x59, 0x10 },
  { 0x08, 0x00, 0x31, 0x08, 0x01, 0x66, 0x08, 0x41, 0x07, 0x2D, 0x98, 0x1D, 0x01, 0x66, 0x08, 0xD9, 0x07, 0x2D, 0x97, 0x40, 0x01, 0x66, 0x07, 0x8B, 0x07, 0x2D, 0x96, 0x11, 0x11, 0x00, 0x00, 0x03, 0xF5, 0x00, 0x01, 0xE3, 0x00, 0xDB, 0x01, 0x1A, 0x01, 0x32, 0x02, 0x3C, 0x00, 0xF9, 0x84, 0x59, 0x10 }
};