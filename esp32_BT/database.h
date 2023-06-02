unsigned char allPathData3Line[54] = { 0x23,	0x24,	0x03,	0x01,	0x66,	0x08,	0xd6,	0x07,	0x2d,	0x97,	0x31,	0x01,	0x66,	0x05,	0xb9,	0x07,	0x2d,	0x9b,	0x4d,	0x01,	0x66,	0x05,	0xb9,	0x07,	0x2d,	0x9b,	0x4d,	0x01,	0x66,	0x05,	0x1c,	0x07,	0x2d,	0x93,	0xad,	0x01,	0x66,	0x05,	0x1c,	0x07,	0x2d,	0x93,	0xad,	0x01,	0x66,	0x08,	0xaf,	0x07,	0x2d,	0x96,	0xf7,	0xBD,	0x25,	0x26 };
unsigned char allPathData4Line[70] = {	0x23,	0x24,	0x04,	0x01,	0x67,	0x6b,	0x8d,	0x07,	0x2e,	0x2e,	0x0e,	0x01,	0x67,	0x6d,	0xc3,	0x07,	0x2e,	0x2e,	0x04,	0x01,	0x67,	0x6d,	0xc3,	0x07,	0x2e,	0x2e,	0x04,	0x01,	0x67,	0x6d,	0xc3,	0x07,	0x2e,	0x26,	0x89,	0x01,	0x67,	0x6d,	0xc3,	0x07,	0x2e,	0x26,	0x89,	0x01,	0x67,	0x6b,	0x75,	0x07,	0x2e,	0x26,	0x89,	0x01,	0x67,	0x6b,	0x75,	0x07,	0x2e,	0x26,	0x89,	0x01,	0x67,	0x6b,	0x75,	0x07,	0x2e,	0x2d,	0xb9,	0x48,	0x25,	0x26 };
unsigned char ifConnBTcmd[] = {0x08,0x00,0x31,0x01,0x59,0x10};
unsigned char sendPathHeadcmd[] = {0x08,0x00,0x31,0x03,0x00,0x10,0x00,0x20,0x3E,0x59,0x10};

unsigned char sendPathOKcmd[] = {0x08,0x00,0x31,0x05,0x59,0x10};

unsigned char allPathData[][38] = {	
{0x08	,0x00	,0x31	,0x04	,0x01	,0x66	,0x04	,0xF6	,0x07	,0x2D	,0x9C	,0xC0	,0x01	,0x66	,0x03	,0xD4	,0x07	,0x2D	,0x9C	,0x40	,0x01	,0x66	,0x03	,0xD4	,0x07	,0x2D	,0x9C	,0x3F	,0x01	,0x66	,0x03	,0x68	,0x07	,0x2D	,0x9B	,0x39	,0x2D	,0x59},
{0x08	,0x00	,0x31	,0x04	,0x01	,0x66	,0x03	,0x67	,0x07	,0x2D	,0x9B	,0x38	,0x01	,0x66	,0x03	,0x5E	,0x07	,0x2D	,0x99	,0xC1	,0x01	,0x66	,0x03	,0x5D	,0x07	,0x2D	,0x99	,0xC1	,0x01	,0x66	,0x03	,0x85	,0x07	,0x2D	,0x98	,0x24	,0xCB	,0x59},
{0x08	,0x00	,0x31	,0x04	,0x01	,0x66	,0x03	,0x85	,0x07	,0x2D	,0x98	,0x24	,0x01	,0x66	,0x03	,0xD4	,0x07	,0x2D	,0x96	,0xF8	,0x01	,0x66	,0x03	,0xD3	,0x07	,0x2D	,0x96	,0xF7	,0x01	,0x66	,0x04	,0x80	,0x07	,0x2D	,0x95	,0xE1	,0xF7	,0x59},
{0x08	,0x00	,0x31	,0x04	,0x01	,0x66	,0x04	,0x80	,0x07	,0x2D	,0x95	,0xE1	,0x01	,0x66	,0x05	,0x85	,0x07	,0x2D	,0x95	,0x1B	,0x01	,0x66	,0x05	,0x85	,0x07	,0x2D	,0x95	,0x1A	,0x01	,0x66	,0x06	,0x99	,0x07	,0x2D	,0x94	,0x5F	,0x90	,0x59},
{0x08	,0x00	,0x31	,0x04	,0x01	,0x66	,0x06	,0x98	,0x07	,0x2D	,0x94	,0x5E	,0x01	,0x66	,0x07	,0x7B	,0x07	,0x2D	,0x94	,0x8F	,0x01	,0x66	,0x07	,0x7B	,0x07	,0x2D	,0x94	,0x8F	,0x01	,0x66	,0x08	,0x85	,0x07	,0x2D	,0x94	,0xF5	,0x8D	,0x59},
{0x08	,0x00	,0x31	,0x04	,0x01	,0x66	,0x08	,0x85	,0x07	,0x2D	,0x94	,0xF5	,0x01	,0x66	,0x09	,0x40	,0x07	,0x2D	,0x95	,0xA1	,0x01	,0x66	,0x09	,0x3F	,0x07	,0x2D	,0x95	,0xA0	,0x01	,0x66	,0x09	,0x84	,0x07	,0x2D	,0x96	,0x8D	,0x31	,0x59},
{0x08	,0x00	,0x31	,0x04	,0x01	,0x66	,0x09	,0x84	,0x07	,0x2D	,0x96	,0x8C	,0x01	,0x66	,0x09	,0xF1	,0x07	,0x2D	,0x98	,0x1F	,0x01	,0x66	,0x09	,0xF0	,0x07	,0x2D	,0x98	,0x1E	,0x01	,0x66	,0x09	,0xD3	,0x07	,0x2D	,0x98	,0xF0	,0x10	,0x59},
{0x08	,0x00	,0x31	,0x04	,0x01	,0x66	,0x09	,0xD3	,0x07	,0x2D	,0x98	,0xF0	,0x01	,0x66	,0x09	,0x31	,0x07	,0x2D	,0x99	,0xD2	,0x01	,0x66	,0x09	,0x30	,0x07	,0x2D	,0x99	,0xD1	,0x01	,0x66	,0x09	,0x09	,0x07	,0x2D	,0x9A	,0x42	,0x5D	,0x59}
};
		   
unsigned char sendInfoHeadcmd[] = {0x08,0x00,0x31,0x06,0x1D,0x59,0x10};

unsigned char offsetData[][36] = {
{0x08	,0x00	,0x31	,0x07	,0x01	,0x66	,0x08	,0x46	,0x07	,0x2D	,0x98	,0x1A	,0x01	,0x66	,0x08	,0xD6	,0x07	,0x2D	,0x97	,0x31	,0x01	,0x66	,0x05	,0xB9	,0x07	,0x2D	,0x9B	,0x4D	,0xFE	,0xDB	,0x11	,0x00	,0x06	,0x97	,0x59	,0x10},
{0x08	,0x00	,0x31	,0x07	,0x01	,0x66	,0x08	,0x46	,0x07	,0x2D	,0x98	,0x1A	,0x01	,0x66	,0x08	,0xD6	,0x07	,0x2D	,0x97	,0x31	,0x01	,0x66	,0x05	,0xB9	,0x07	,0x2D	,0x9B	,0x4D	,0xFE	,0xDD	,0x11	,0x00	,0x07	,0x90	,0x59	,0x10},
{0x08	,0x00	,0x31	,0x07	,0x01	,0x66	,0x08	,0x44	,0x07	,0x2D	,0x98	,0x1A	,0x01	,0x66	,0x08	,0xD6	,0x07	,0x2D	,0x97	,0x31	,0x01	,0x66	,0x05	,0xB9	,0x07	,0x2D	,0x9B	,0x4D	,0xFE	,0xE0	,0x11	,0x00	,0x08	,0xA0	,0x59	,0x10},
{0x08	,0x00	,0x31	,0x07	,0x01	,0x66	,0x08	,0x44	,0x07	,0x2D	,0x98	,0x1B	,0x01	,0x66	,0x08	,0xD6	,0x07	,0x2D	,0x97	,0x31	,0x01	,0x66	,0x05	,0xB9	,0x07	,0x2D	,0x9B	,0x4D	,0xFE	,0xE2	,0x11	,0x00	,0x08	,0xA3	,0x59	,0x10},
{0x08	,0x00	,0x31	,0x07	,0x01	,0x66	,0x08	,0x43	,0x07	,0x2D	,0x98	,0x1B	,0x01	,0x66	,0x08	,0xD6	,0x07	,0x2D	,0x97	,0x31	,0x01	,0x66	,0x05	,0xB9	,0x07	,0x2D	,0x9B	,0x4D	,0xFE	,0xE4	,0x11	,0x00	,0x09	,0xA3	,0x59	,0x10},
{0x08	,0x00	,0x31	,0x07	,0x01	,0x66	,0x08	,0x43	,0x07	,0x2D	,0x98	,0x1B	,0x01	,0x66	,0x08	,0xD6	,0x07	,0x2D	,0x97	,0x31	,0x01	,0x66	,0x05	,0xB9	,0x07	,0x2D	,0x9B	,0x4D	,0xFE	,0xE7	,0x11	,0x00	,0x09	,0xA0	,0x59	,0x10},
{0x08	,0x00	,0x31	,0x07	,0x01	,0x66	,0x08	,0x43	,0x07	,0x2D	,0x98	,0x1D	,0x01	,0x66	,0x08	,0xD6	,0x07	,0x2D	,0x97	,0x31	,0x01	,0x66	,0x05	,0xB9	,0x07	,0x2D	,0x9B	,0x4D	,0xFE	,0xE8	,0x11	,0x00	,0x09	,0xA9	,0x59	,0x10},
{0x08	,0x00	,0x31	,0x07	,0x01	,0x66	,0x08	,0x41	,0x07	,0x2D	,0x98	,0x1D	,0x01	,0x66	,0x08	,0xD6	,0x07	,0x2D	,0x97	,0x31	,0x01	,0x66	,0x05	,0xB9	,0x07	,0x2D	,0x9B	,0x4D	,0xFE	,0xEC	,0x11	,0x00	,0x0A	,0xAC	,0x59	,0x10},
{0x08	,0x00	,0x31	,0x07	,0x01	,0x66	,0x08	,0x41	,0x07	,0x2D	,0x98	,0x1F	,0x01	,0x66	,0x08	,0xD6	,0x07	,0x2D	,0x97	,0x31	,0x01	,0x66	,0x05	,0xB9	,0x07	,0x2D	,0x9B	,0x4D	,0xFE	,0xED	,0x11	,0x00	,0x0A	,0xAF	,0x59	,0x10},
{0x08	,0x00	,0x31	,0x07	,0x01	,0x66	,0x08	,0x40	,0x07	,0x2D	,0x98	,0x1F	,0x01	,0x66	,0x08	,0xD6	,0x07	,0x2D	,0x97	,0x31	,0x01	,0x66	,0x05	,0xB9	,0x07	,0x2D	,0x9B	,0x4D	,0xFE	,0xEF	,0x11	,0x00	,0x0B	,0xAD	,0x59	,0x10},
{0x08	,0x00	,0x31	,0x07	,0x01	,0x66	,0x08	,0x40	,0x07	,0x2D	,0x98	,0x1F	,0x01	,0x66	,0x08	,0xD6	,0x07	,0x2D	,0x97	,0x31	,0x01	,0x66	,0x05	,0xB9	,0x07	,0x2D	,0x9B	,0x4D	,0xFE	,0xF0	,0x11	,0x00	,0x0B	,0xB2	,0x59	,0x10},
{0x08	,0x00	,0x31	,0x07	,0x01	,0x66	,0x08	,0x3E	,0x07	,0x2D	,0x98	,0x20	,0x01	,0x66	,0x08	,0xD6	,0x07	,0x2D	,0x97	,0x31	,0x01	,0x66	,0x05	,0xB9	,0x07	,0x2D	,0x9B	,0x4D	,0xFE	,0xF2	,0x11	,0x00	,0x0B	,0xF1	,0x59	,0x10},
{0x08	,0x00	,0x31	,0x07	,0x01	,0x66	,0x08	,0x3E	,0x07	,0x2D	,0x98	,0x20	,0x01	,0x66	,0x08	,0xD6	,0x07	,0x2D	,0x97	,0x31	,0x01	,0x66	,0x05	,0xB9	,0x07	,0x2D	,0x9B	,0x4D	,0xFE	,0xF4	,0x11	,0x00	,0x0C	,0xF0	,0x59	,0x10},
{0x08	,0x00	,0x31	,0x07	,0x01	,0x66	,0x08	,0x3E	,0x07	,0x2D	,0x98	,0x20	,0x01	,0x66	,0x08	,0xD6	,0x07	,0x2D	,0x97	,0x31	,0x01	,0x66	,0x05	,0xB9	,0x07	,0x2D	,0x9B	,0x4D	,0xFE	,0xF6	,0x11	,0x00	,0x0C	,0xF2	,0x59	,0x10}

};