#include <BluetoothSerial.h>
#include "database.h"
#define LED 33

BluetoothSerial BT;

char dataFlag = 0;
int noAck = 0;

int allPathInfoIndex = 0;
int offsetInfoIndex = 0;

void setup() {
  Serial.begin(115200);
  BT.begin("Ian");
  pinMode(LED, OUTPUT);
}

void loop() {
  switch(dataFlag){
    case 0: //詢問是否連線
    	BT.write(isConnect, sizeof(isConnect));
      break;
    case 1: //所有路線的頭
      BT.write(allPathHead, sizeof(allPathHead));
      break;
    case 2: //所有路線資料
      BT.write(allPathInfo[allPathInfoIndex], sizeof(allPathInfo[allPathInfoIndex]));
      break;
    case 3: //所有路線完成
      BT.write(allPathOk, sizeof(allPathOk));
      break;
    case 4: //offset的頭
      BT.write(offsetHead, sizeof(offsetHead));
      break;
    case 5:  //offset資料
      BT.write(offsetInfo[offsetInfoIndex], sizeof(offsetInfo[offsetInfoIndex]));
      if(offsetInfoIndex < 4){
        offsetInfoIndex++;
      }else{
        offsetInfoIndex = 0;
      }
      break;
  }

  blingBling();

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

    if(packetOk(packet)){ //0x03 0x01
      noAck = 0;
      switch(dataFlag){
        case 0:
          dataFlag = 1;
          break;
        case 1:
          dataFlag = 2;
          break;
        case 2:
          if(allPathInfoIndex == 7){
            allPathInfoIndex = 0;
            dataFlag = 3;
          }else{
            allPathInfoIndex++;
          }
          break;
        case 3:
          dataFlag = 4;
          break;
        case 4:
          dataFlag = 5;
          break;
      }
    }else{
      isNoAck();
    }
  }
}

void blingBling(){
  digitalWrite(LED, 1);
  delay(30);
  digitalWrite(LED, 0);
  delay(70);
}

bool packetOk(byte packet[2]){
  return packet[0] == 0x03 && packet[1] == 0x01? true : false;
}

void isNoAck(){
  if(noAck < 11){
    noAck++;
  }else{
    dataFlag = 0;
    noAck = 0;
  }
}