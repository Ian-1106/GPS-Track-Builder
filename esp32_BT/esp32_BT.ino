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
  Serial.begin(9600);
  BT.begin("ESPBT");
  pinMode(LED, OUTPUT);
}

void loop() {
  switch(dataFlag){
    case 0:
      Serial.println("確認連線?");
      BT.write(ifConnBTcmd, sizeof(ifConnBTcmd));
      break;

    case 1:
      BT.write(sendPathHeadcmd, sizeof(sendPathHeadcmd));
      break;

	case 2:
		BT.write(allPathData[pathIndex], sizeof(allPathData[pathIndex]));//傳輸給藍牙
		break;
	case 3:
		BT.write(sendPathOKcmd, sizeof(sendPathOKcmd));
		break;

	case 4:
		Serial.print("offset start");
		BT.write(sendInfoHeadcmd, sizeof(sendInfoHeadcmd));//傳輸給藍牙

		break;
	case 5:
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
  delay(450);
	
  if (BT.available()) {
    byte packet[2] = { 0, 0};
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
      if(dataFlag == 0){
        dataFlag = 1;
      }
      else if(dataFlag == 1){
        dataFlag = 2;
      }
      else if(dataFlag == 2){
        if(pathIndex < 8){
          pathIndex++;
        }else{
          
        }
      }
    }
  }
}