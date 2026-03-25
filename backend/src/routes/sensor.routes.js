// -------------------------------------------------
// routes/sensor.routes.js
// Registers Express routes for the sensor resource
// -------------------------------------------------
const express = require('express');
const { postSensorData, getLatestSensorData } = require('../controllers/sensor.controller');

const router = express.Router();

/**
 * POST /api/sensor
 * Used by ESP32 to push sensor readings
 */
router.post('/', postSensorData);

/**
 * GET /api/sensor
 * Opening this URL in a browser sends GET (not POST). ESP32 must POST JSON here.
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message:
      'Sensor ingest is POST + JSON only. Browsers load this page with GET, so you see this help text.',
    use: {
      esp32: 'POST http://<PC-IP>:3000/api/sensor with Content-Type: application/json',
      dashboard: 'GET http://<PC-IP>:3000/api/sensor/latest',
    },
  });
});

/**
 * GET /api/sensor/latest
 * Used by Angular dashboard to poll the most-recent reading
 */
router.get('/latest', getLatestSensorData);

module.exports = router;
