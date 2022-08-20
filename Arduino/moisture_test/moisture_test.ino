
#include <WiFi.h>
#include "Esp32MQTTClient.h"



// Please input the SSID and password of WiFi
char* ssid     = "enter name of wifi";
char* password = "enter password og wifi";
static const char* connectionString = "HostName=iot-hub-dnd.azure-devices.net;DeviceId=button-dnd;SharedAccessKey=4TIbJPyu3WyAoEMWuiZrHREaYmfHlVvnVusyPyBK8Ew=";
static bool hasIoTHub = false;

int msensor = A2; // moisture sensor is connected with the analog pin A1 of the Arduino
int msvalue = 0; // moisture sensor value 
boolean flag = false; 
void setup() {
  Serial.begin(9600);

  Serial.println("Starting connecting WiFi.");
  delay(10);
  WiFi.disconnect();
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  pinMode(msensor, INPUT);

  if (!Esp32MQTTClient_Init((const uint8_t*)connectionString))
  {
    hasIoTHub = false;
    Serial.println("Initializing IoT hub failed.");
    return;
  }
  hasIoTHub = true;


}
 
void loop() {
  Serial.println("start sending events.");
  if (hasIoTHub)
  {
     char buff[128];
    //replace the following line with your data sent to Azure IoTHub
      msvalue = analogRead(msensor);
      Serial.println(msvalue); 
      snprintf(buff, 128,"%d?12345",msvalue);
      if (Esp32MQTTClient_SendEvent(buff))
      {
        Serial.println("Sending data succeed");
      }
      else
      {
        Serial.println("Failure...");
      }
    delay(100);
  }
  delay(50000);      
}
