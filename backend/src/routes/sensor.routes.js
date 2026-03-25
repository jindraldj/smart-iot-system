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
 * GET /api/sensor/latest
 * Used by Angular dashboard to poll the most-recent reading
 */
router.get('/latest', getLatestSensorData);

module.exports = router;
