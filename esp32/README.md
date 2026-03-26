# ESP32 Smart Bus Connection Setup

## 🔧 Configuration Required

1. **Update WiFi Credentials** in `smart_bus_esp32.ino`:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";        // Your WiFi network name
   const char* password = "YOUR_WIFI_PASSWORD"; // Your WiFi password
   ```

2. **Update Server IP** if needed:
   ```cpp
   const char* serverUrl = "http://192.168.29.185:3000/api/sensor";
   ```

## 📋 Hardware Connections

| ESP32 Pin | Sensor | Purpose |
|-----------|--------|---------|
| GPIO 4    | Temp   | Temperature sensor |
| GPIO 5    | Ultrasonic Trig | Distance sensor trigger |
| GPIO 18   | Ultrasonic Echo | Distance sensor echo |
| GPIO 34   | Gas    | Gas sensor analog |
| GPIO 35   | Flame  | Flame sensor digital |
| GPIO 2    | Button | Emergency button |

## 🚀 Upload to ESP32

1. Install Arduino IDE
2. Install ESP32 board manager
3. Install required libraries:
   - `WiFi` (built-in)
   - `HTTPClient` (built-in)
   - `ArduinoJson` by Benoit Blanchon

4. Connect ESP32 to computer
5. Select correct board and port
6. Upload the sketch

## 🔍 Testing

1. Open Serial Monitor (115200 baud)
2. Check WiFi connection status
3. Verify data is being sent every 2 seconds
4. Check backend console for incoming requests

## 📊 Expected Output

Serial Monitor should show:
```
Connecting to WiFi...
.....
WiFi connected!
IP Address: 192.168.29.XXX
HTTP Response code: 200
Response: {"success":true,"message":"Sensor data received"}
```

Backend console should show:
```
[HTTP] POST /api/sensor ← 192.168.29.XXX
[HTTP]   body keys: temperature, distance, gasValue, gasDetected, flameDetected, emergencyPressed, danger
```

## ⚠️ Troubleshooting

- **No WiFi Connection**: Check SSID/password
- **No HTTP Response**: Check server IP and ensure backend is running
- **404 Error**: Verify endpoint URL is correct
- **Firewall Issues**: Temporarily disable Windows firewall
