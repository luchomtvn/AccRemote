/*
    Based on Neil Kolban example for IDF: https://github.com/nkolban/esp32-snippets/blob/master/cpp_utils/tests/BLE%20Tests/SampleWrite.cpp
    Ported to Arduino ESP32 by Evandro Copercini
*/

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID        "0000181c-0000-1000-8000-00805f9b34fb"
#define CHARACTERISTIC_UUID_READ "00002a6f-0000-1000-8000-00805f9b34fb"
#define CHARACTERISTIC_UUID_TOGGLE "c852651d-bcb7-4ca7-bbd7-2c13e99608e8"

int led = LED_BUILTIN;
bool deviceConnected = false;
uint32_t value = 0;

BLECharacteristic *pCharacteristicRead;
BLECharacteristic *pCharacteristicToggle;
BLEService *pService;
BLEServer *pServer;

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
    }
};

class MyCallbacksWrite: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      std::string value = pCharacteristic->getValue();

      if (value.length() > 0) {
        Serial.println("*********");
        Serial.print("New value: ");
        for (int i = 0; i < value.length(); i++)
          Serial.print(value[i]);

        Serial.println();
        Serial.println("*********");
      }

        if(value == "on"){
          digitalWrite(led, HIGH);
        }
        else if (value == "off"){
          digitalWrite(led, LOW);
        }
    }
};

class MyCallbacksToggle: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      std::string value = pCharacteristic->getValue();

        if(value == "on"){
          digitalWrite(led, HIGH);
          Serial.println("Led ON");
        }
        else if (value == "off"){
          digitalWrite(led, LOW);
          Serial.println("Led OFF");
        }
    }
};

void setup() {
  Serial.begin(115200);
  pinMode(led,OUTPUT);

  Serial.println("-------------ACC-REMOTE-CONTROL-MODULE-------------");
  Serial.println("MLTech 2019");
  Serial.println("--------------------------");
  Serial.println("--------------------------");
  Serial.println("--------------------------");
  Serial.println("--------------------------");
  Serial.println("--------------------------");

  BLEDevice::init("AccControl");
  pServer = BLEDevice::createServer();

  pService = pServer->createService(SERVICE_UUID);
  pServer->setCallbacks(new MyServerCallbacks());
  
  pCharacteristicRead = pService->createCharacteristic(
                                         CHARACTERISTIC_UUID_READ,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY 
                                       );

  pCharacteristicRead->setCallbacks(new MyCallbacksWrite());

  pCharacteristicRead->setValue("This is for writing...");

  pCharacteristicToggle->setValue("This is for Toggle");


  pService->start();

  BLEAdvertising *pAdvertising = pServer->getAdvertising();
  pAdvertising->start();
}

void loop() {
  if(deviceConnected){
     Serial.print("Device connected!, value: ");
     Serial.println(value);
     pCharacteristicRead->setValue((uint8_t*)&value, 4);
     pCharacteristicRead->notify();
     value++;
    
  }
  // put your main code here, to run repeatedly:
  delay(1000);

}
