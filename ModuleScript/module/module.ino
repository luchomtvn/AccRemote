/*
    Based on Neil Kolban example for IDF: https://github.com/nkolban/esp32-snippets/blob/master/cpp_utils/tests/BLE%20Tests/SampleWrite.cpp
    Ported to Arduino ESP32 by Evandro Copercini
*/

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <WiFiMulti.h>

// WiFi
WiFiMulti WiFiMulti;

// MQTT constants
#define SERVICE_UUID        "0000181c-0000-1000-8000-00805f9b34fb"
#define CHARACTERISTIC_UUID_READ "00002a6f-0000-1000-8000-00805f9b34fb"

// for led notifications
volatile int interruptCounter;
int totalInterruptCounter;
hw_timer_t * timer = NULL;
portMUX_TYPE timerMux = portMUX_INITIALIZER_UNLOCKED;
int led = LED_BUILTIN;
int toggle_rate = 1000000;

//BLE
bool deviceConnected = false;
uint32_t value = 0;
BLECharacteristic *pCharacteristicRead;
BLEService *pService;
BLEServer *pServer;

//Json Serializer-Deserializer
DynamicJsonDocument doc(200);


// LED notification ISR
void IRAM_ATTR onTimer() {
  portENTER_CRITICAL_ISR(&timerMux);
  portEXIT_CRITICAL_ISR(&timerMux);
  digitalWrite(led, !digitalRead(led));
}

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.print("Connected!");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.print("Disconnected!");
    }
};

class MyCallbacksWrite: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
        std::string value = pCharacteristic->getValue();
        String ssid = "";
        String pass = "";
        String email = "";

        if (value.length() > 0) {
            Serial.println("*********");
            Serial.print("New value: ");
            for (int i = 0; i < value.length(); i++) {
                    Serial.print(value[i]);
                }
            Serial.println();
            Serial.println("*********");

            deserializeJson(doc, value);
            ssid = doc["wifi_ssid"].as<String>();
            pass = doc["wifi_passwd"].as<String>();
            email = doc["user_email"].as<String>();
            Serial.println("SSID: " + ssid);
            Serial.println("Password: " + pass);
            Serial.println("E-Mail: " + email);
        }
       Serial.println("Attempting connection to " + ssid + "");
       //WiFiMulti.addAP("SSID", "passpasspass");º
       //while(WiFiMulti.run() != WL_CONNECTED) {
       while(0) {
        Serial.print(".");
        timerAlarmWrite(timer, 500000, true);
        delay(500);
      }
      Serial.println("Connected to WiFi!");
      timerAlarmDisable(timer);
      digitalWrite(led, HIGH);
    }
};

void setup() {
  Serial.begin(115200);
  pinMode(led,OUTPUT);

  timer = timerBegin(0, 80, true);
  timerAttachInterrupt(timer, &onTimer, true);
  timerAlarmWrite(timer, 1000000, true);
  timerAlarmEnable(timer);

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


  pService->start();

  BLEAdvertising *pAdvertising = pServer->getAdvertising();
  pAdvertising->start();
}

void loop() {
  if(deviceConnected){
     pCharacteristicRead->notify();
  }
  delay(2000);

  

}
