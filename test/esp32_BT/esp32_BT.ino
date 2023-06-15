#include <BluetoothSerial.h>
#include "database.h"
#define LED 33

BluetoothSerial BT;
char dataFlag = 0;

int dataIndex = 0;
int pathIndex = 0;
int noack_count = 0;
int send_path_ok = 0;

void setup() {
  Serial.begin(115200);
  BT.begin("ESPBT");
  pinMode(LED, OUTPUT);
}

void loop() {
	if(	noack_count >= 10&&send_path_ok==0){
		dataFlag = 0;
		pathIndex =0;
	}
	noack_count++;

  switch(dataFlag){
    case 0:
		Serial.println("0");
		BT.write(ifConnBTcmd, sizeof(ifConnBTcmd));
		break;

    case 1:
		Serial.println("1");
		BT.write(sendPathHeadcmd, sizeof(sendPathHeadcmd));
		break;

	case 2:
		Serial.println("2");
		Serial.print("pathIndex");
		Serial.println(pathIndex,DEC);
		BT.write(allPathData[pathIndex], sizeof(allPathData[pathIndex]));//傳輸給藍牙
		break;
	case 3:
		Serial.println("3");

		BT.write(sendPathOKcmd, sizeof(sendPathOKcmd));
		break;

	case 4:
		//Serial.print(sizeof(sendInfoHeadcmd));
		Serial.println("4");
		BT.write(sendInfoHeadcmd, sizeof(sendInfoHeadcmd));//傳輸給藍牙

		break;
	case 5:
		Serial.println("5");
		BT.write(offsetData[dataIndex], sizeof(offsetData[dataIndex]));//傳輸給藍牙
		if(dataIndex+1==14){
			dataIndex=0;
		}else{
			dataIndex++;
		}
		break;
  }

  digitalWrite(LED, 1);
  delay(30);
  digitalWrite(LED, 0);
  delay(70);
	
  if (BT.available()) {
    byte packet[2]; // 建立一個byte型別的陣列，用於儲存接收到的封包
    packet[0] = packet[1] = 0;

    for (int i = 0; i < 2; i++) {
      packet[i] = BT.read(); // 逐一讀取兩個byte的封包
    }

    Serial.print("Received packet: ");
    for (int i = 0; i < 2; i++) {
      Serial.print(packet[i], HEX);
      Serial.print(" ");
    }
    Serial.println();
	
    if(packet[0] == 0x03 && packet[1] == 0x01){
      noack_count=0;

      if(dataFlag<2){
        dataFlag++;
	  }
      else if(dataFlag == 2){
        pathIndex++;

        if(pathIndex>=8){
        dataFlag = 3;

        }

      }
      else if(dataFlag == 3){
        dataFlag=4;
        send_path_ok =1;
      }
      else if(dataFlag == 4){
        dataFlag = 5;
      }
    }
  }
}