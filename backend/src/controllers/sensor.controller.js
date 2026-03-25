// -------------------------------------------------
// controllers/sensor.controller.js
// Handles HTTP request/response for sensor endpoints
// -------------------------------------------------
const { saveSensorData, getLatestData } = require('../services/sensor.service');
const { sendSuccess, sendError } = require('../utils/response.util');

/**
 * postSensorData
 * Route:  POST /api/sensor
 * Purpose: Receive sensor readings from ESP32 and persist to MongoDB
 *
 * Expected body (JSON):
 * {
 *   temperature: number,
 *   distance: number,
 *   gasValue: number,
 *   gasDetected: boolean,
 *   flameDetected: boolean,
 *   emergencyPressed: boolean (or "emergency" — both accepted),
 *   danger: boolean (optional; computed server-side if omitted)
 * }
 */
const postSensorData = async (req, res) => {
  try {
    console.log('\n--- 📥 INCOMING POST REQUEST FROM ESP32 ---');
    console.log('Raw Payload received:', req.body);

    const {
      temperature,
      distance,
      gasValue,
      gasDetected,
      flameDetected,
      emergencyPressed,
      danger,
    } = req.body;

    // ESP32 sketch sends "emergency"; API docs use "emergencyPressed" — support both
    const finalEmergency =
      emergencyPressed !== undefined ? emergencyPressed : req.body.emergency;

    // Calculate 'danger' if omitted (align with ESP32: gas | flame | emergency | distance < 10 cm)
    let finalDanger = danger;
    if (finalDanger === undefined) {
      finalDanger =
        Boolean(gasDetected) ||
        Boolean(flameDetected) ||
        Boolean(finalEmergency) ||
        Number(distance) < 10;
      console.log('ℹ️  Calculating "danger" status on backend:', finalDanger);
    }

    // --- Basic validation: ensure all required fields are present ---
    const missingFields = [];
    if (temperature === undefined) missingFields.push('temperature');
    if (distance === undefined) missingFields.push('distance');
    if (gasValue === undefined) missingFields.push('gasValue');
    if (gasDetected === undefined) missingFields.push('gasDetected');
    if (flameDetected === undefined) missingFields.push('flameDetected');
    if (finalEmergency === undefined) missingFields.push('emergencyPressed or emergency');
    if (finalDanger === undefined) missingFields.push('danger');

    if (missingFields.length > 0) {
      console.warn('❌ ERROR: Missing fields from ESP32 payload:', missingFields);
      return sendError(
        res,
        400,
        `Missing required fields: ${missingFields.join(', ')}`
      );
    }

    // --- Persist the reading via the service layer ---
    const savedData = await saveSensorData({
      temperature,
      distance,
      gasValue,
      gasDetected,
      flameDetected,
      emergencyPressed: finalEmergency,
      danger: finalDanger,
    });

    console.log('✅ SUCCESS: Data saved to MongoDB. ID:', savedData._id);

    // Log a server-side warning if the system is in a dangerous state
    if (finalDanger) {
      console.warn('⚠️  DANGER condition active (computed or from payload)!');
    }

    console.log('--- 🏁 END POST REQUEST ---\n');
    return sendSuccess(res, 201, 'Sensor data saved successfully', savedData);
  } catch (error) {
    console.error('❌ postSensorData error:', error.message);
    // Handle Mongoose validation errors specifically
    if (error.name === 'ValidationError') {
      return sendError(res, 400, error.message);
    }
    return sendError(res, 500, 'Internal server error');
  }
};

/**
 * getLatestSensorData
 * Route:  GET /api/sensor/latest
 * Purpose: Return the most-recently stored sensor reading (polled by Angular dashboard)
 */
const getLatestSensorData = async (req, res) => {
  try {
    const data = await getLatestData();

    // Return 200 with null data instead of 404 if no readings exist yet
    // This prevents the browser console from filling up with 404 Not Found errors
    if (!data) {
      return sendSuccess(res, 200, 'No sensor data found yet', null);
    }

    return sendSuccess(res, 200, 'Latest sensor data retrieved', data);
  } catch (error) {
    console.error('getLatestSensorData error:', error.message);
    return sendError(res, 500, 'Internal server error');
  }
};

module.exports = { postSensorData, getLatestSensorData };
