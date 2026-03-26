#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ESP32Servo.h>

// ✅ NEW: WiFi + HTTP
#include <WiFi.h>
#include <HTTPClient.h>

// ---------------- WIFI CONFIG ----------------
const char* ssid = "Airtel_subh_2300";
const char* password = "Air@60975";

const char* serverUrl = "http://192.168.29.185:3000/api/sensor";

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// SENSOR PINS
#define TEMP_PIN 35
#define MQ2_PIN 34
#define TRIG_PIN 5
#define ECHO_PIN 18
#define FLAME_PIN 19
#define EMERGENCY_BTN 4
#define RED_LED 26
#define WHITE_LED 27
#define BUZZER 25
#define PUMP_PIN 33

// SERVO PINS
#define FRONT_SERVO_PIN 13
#define BACK_SERVO_PIN 12

// THRESHOLDS
int gasThreshold = 1500;

// VARIABLES
float lastTemp = 0;
float lastDistance = 0;

// SERVO OBJECTS
Servo frontDoorServo;
Servo backDoorServo;

// -------- TEMPERATURE --------
float getTemperature() {
    int val = analogRead(TEMP_PIN);
    if(val == 0) return lastTemp;
    float voltage = val * (3.3 / 4095.0);
    float temp = voltage * 100.0;
    lastTemp = temp;
    return temp;
}

// -------- DISTANCE --------
float getDistance() {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(5);

    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH, 30000);

    if(duration <= 0) return lastDistance;

    float dist = duration * 0.0343 / 2;

    if(dist < 2 || dist > 400) return lastDistance;

    lastDistance = dist;
    return dist;
}

// -------- EXISTING SEND DATA (kept same, only Serial instead of Bluetooth) --------
void sendDataToMobile(float temperature, float distance, int gasValue, bool gasDetected,
                      bool flameDetected, bool emergencyPressed) {

    Serial.println("------ BUS SENSOR DATA ------");

    Serial.print("Temperature: "); Serial.print(temperature); Serial.println(" C");
    Serial.print("Distance: "); Serial.print(distance); Serial.println(" cm");

    Serial.print("Gas Value: "); Serial.print(gasValue); Serial.print(" -> ");
    Serial.println(gasDetected ? "ALERT ⚠" : "SAFE ✅");

    Serial.print("Flame: "); Serial.println(flameDetected ? "YES 🔥" : "NO");

    if(emergencyPressed)
        Serial.println("🚨 EMERGENCY BUTTON PRESSED");

    Serial.println("-----------------------------");
}

// -------- NEW: SEND DATA TO SERVER --------
void sendDataToServer(float temperature, float distance, int gasValue,
                      bool gasDetected, bool flameDetected, bool emergencyPressed) {

    if (WiFi.status() == WL_CONNECTED) {

        HTTPClient http;

        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");

        String json = "{";
        json += "\"temperature\":" + String(temperature) + ",";
        json += "\"distance\":" + String(distance) + ",";
        json += "\"gasValue\":" + String(gasValue) + ",";
        json += "\"gasDetected\":" + String(gasDetected ? "true" : "false") + ",";
        json += "\"flameDetected\":" + String(flameDetected ? "true" : "false") + ",";
        json += "\"emergencyPressed\":" + String(emergencyPressed ? "true" : "false") + ",";
        json += "\"danger\":" + String((gasDetected || flameDetected || emergencyPressed || distance < 10) ? "true" : "false");
        json += "}";

        Serial.print("Sending JSON: ");
        Serial.println(json);
        
        int httpResponseCode = http.POST(json);

        Serial.print("HTTP Response: ");
        Serial.println(httpResponseCode);
        
        if (httpResponseCode > 0) {
            String response = http.getString();
            Serial.print("Server Response: ");
            Serial.println(response);
        }

        http.end();
    }
}

// -------- SETUP --------
void setup() {
    Serial.begin(115200);

    // ✅ NEW: WIFI SETUP
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }

    Serial.println("WiFi Connected");
    Serial.println(WiFi.localIP());

    Wire.begin(21,22);
    display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
    display.clearDisplay();
    display.display();

    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    pinMode(FLAME_PIN, INPUT);
    pinMode(EMERGENCY_BTN, INPUT_PULLUP);

    pinMode(RED_LED, OUTPUT);
    pinMode(WHITE_LED, OUTPUT);
    pinMode(BUZZER, OUTPUT);
    pinMode(PUMP_PIN, OUTPUT);

    frontDoorServo.attach(FRONT_SERVO_PIN);
    backDoorServo.attach(BACK_SERVO_PIN);

    frontDoorServo.write(0);
    backDoorServo.write(0);

    digitalWrite(WHITE_LED, HIGH);
    digitalWrite(PUMP_PIN, LOW);
}

// -------- LOOP --------
void loop() {

    float temperature = getTemperature();
    float distance = getDistance();
    int gasValue = analogRead(MQ2_PIN);

    bool gasDetected = gasValue > gasThreshold;
    bool flameDetected = digitalRead(FLAME_PIN) == LOW;
    bool emergencyPressed = digitalRead(EMERGENCY_BTN) == LOW;

    bool danger = gasDetected || flameDetected || emergencyPressed || (distance < 10);

    digitalWrite(BUZZER, danger);
    digitalWrite(RED_LED, danger);

    if(flameDetected){
        digitalWrite(PUMP_PIN, HIGH);
        frontDoorServo.write(165);
        backDoorServo.write(165);
    }
    else{
        digitalWrite(PUMP_PIN, LOW);
        frontDoorServo.write(0);
        backDoorServo.write(0);
    }

    // ✅ EXISTING (unchanged logic)
    sendDataToMobile(temperature, distance, gasValue, gasDetected,
                     flameDetected, emergencyPressed);

    // ✅ NEW (WiFi API)
    sendDataToServer(temperature, distance, gasValue, gasDetected,
                     flameDetected, emergencyPressed);

    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);

    if(emergencyPressed){
        display.setTextSize(2);
        display.setCursor(0,20);
        display.println("EMERGENCY!");
    }
    else{
        display.setTextSize(1);
        display.setCursor(0,0);
        display.print("Temp: "); display.println(temperature);
        display.print("Dist: "); display.println(distance);
        display.print("Gas: "); display.println(gasDetected?"ALERT":"SAFE");
        display.print("Flame: "); display.println(flameDetected?"YES":"NO");
        display.print("Emergency: "); display.println(emergencyPressed?"YES":"NO");
    }

    display.display();

    delay(500);
}