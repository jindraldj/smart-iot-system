# IoT Smart Bus System - Full Stack Dashboard

A production-ready IoT dashboard built to monitor live telemetry and safety data from an ESP32 microcontroller over WiFi. The system consists of a REST API backend and an Angular Material + Tailwind CSS realtime frontend.

## 🚀 Startup Scripts (Linux/macOS)
To run the system, there are two separate shell scripts in the root directory.

First, make them executable:
```bash
chmod +x start-api.sh start-ui.sh
```

**1. Start the Backend API** (Make sure MongoDB is running first):
```bash
./start-api.sh
```
This will launch the Node.js backend on `localhost:3000`.

**2. Start the Frontend UI:**
```bash
./start-ui.sh
```
This will compile and launch the Angular dashboard on `localhost:4200`. Wait 10-15 seconds for it to compile, then open it in your browser.

---

## 🛠 Tech Stack
- **Database:** MongoDB (using Mongoose ODM)
- **Backend:** Node.js, Express.js
- **Frontend:** Angular v15, Angular Material UI, Tailwind CSS
- **Microcontroller:** (Target) ESP32

---

## 📁 Repository Structure
- **`/backend/`**
  - Clean MVC Architecture (`models/`, `controllers/`, `routes/`, `services/`, `utils/`)
  - Entry points: `app.js` and `server.js`
  - `.env` contains MongoDB connection strings and PORT configs.
- **`/frontend/`**
  - Built with Angular CLI
  - `src/app/modules/dashboard/` contains the UI components.
  - `src/app/core/services/sensor.service.ts` contains the RxJS 1-second polling logic syncing data with the backend.

---

## 📡 Hardware / ESP32 Integration

To send live data to this system from your ESP32, ensure the ESP32 is on the same WiFi network as the machine running the backend. 

Determine your computer's local WiFi IP Address (e.g. `192.168.1.50`).

The ESP32 should issue an **HTTP POST** request to `http://<YOUR_LOCAL_IP>:3000/api/sensor` with the following JSON Payload:

```json
{
  "temperature": 25.4,
  "distance": 80,
  "gasValue": 75,
  "gasDetected": false,
  "flameDetected": false,
  "emergencyPressed": false,
  "danger": false
}
```

If `danger`, `gasDetected`, `flameDetected`, or `emergencyPressed` resolve to `true`, the Angular Dashboard UI will instantly flash red warning alerts.

---

## 🧪 Testing with cURL / Postman

If you don't have the ESP32 hooked up yet, you can test the UI by simulating sensor data:

**Simulate Normal Conditions:**
```bash
curl -X POST http://localhost:3000/api/sensor \
  -H "Content-Type: application/json" \
  -d "{\"temperature\":22,\"distance\":100,\"gasValue\":30,\"gasDetected\":false,\"flameDetected\":false,\"emergencyPressed\":false,\"danger\":false}"
```

**Simulate Danger Conditions:**
```bash
curl -X POST http://localhost:3000/api/sensor \
  -H "Content-Type: application/json" \
  -d "{\"temperature\":65,\"distance\":15,\"gasValue\":245,\"gasDetected\":true,\"flameDetected\":true,\"emergencyPressed\":false,\"danger\":true}"
```
