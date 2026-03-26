// -------------------------------------------------
// app.js
// Express application setup — middleware + routes
// -------------------------------------------------
const express = require('express');
const cors = require('cors');
const path = require('path');
const sensorRoutes = require('./routes/sensor.routes');

const app = express();

// --- Middleware ---

// Enable CORS so the Angular frontend (port 4200) can call the API (port 3000)
app.use(cors());

// Parse incoming JSON request bodies (sent by ESP32 and Angular)
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Log every request — if ESP32 POST never appears here, the packet is not reaching this PC (IP / firewall / Wi‑Fi)
app.use((req, res, next) => {
  const who = req.ip || req.socket?.remoteAddress || '?';
  console.log(`[HTTP] ${req.method} ${req.originalUrl} ← ${who}`);
  if (req.method === 'POST' && req.body && Object.keys(req.body).length > 0) {
    console.log(`[HTTP]   body keys: ${Object.keys(req.body).join(', ')}`);
  }
  next();
});

// Parse URL-encoded bodies (for form submissions, if needed)
app.use(express.urlencoded({ extended: true }));

// --- Routes ---

// Mount sensor routes under /api/sensor
app.use('/api/sensor', sensorRoutes);

// --- Health check route ---
app.get('/', (req, res) => {
  res.json({ message: '🚀 IoT Bus System API is running' });
});

// --- 404 handler for unknown routes ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;
