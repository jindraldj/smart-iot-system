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
 *   emergencyPressed: boolean,
 *   danger: boolean
 * }
 */
const postSensorData = async (req, res) => {
  try {
    console.log('\n--- 📥 INCOMING POST REQUEST FROM ESP32 ---');
    console.log('Raw Payload received:', req.body);
    
    // --- NEW: Flexible Field Handling ---
    // Handle 'emergency' as an alias for 'emergencyPressed'
    const finalEmergency = emergencyPressed !== undefined ? emergencyPressed : req.body.emergency;
    
    // Calculate 'danger' if it's missing (using ESP32 logic)
    let finalDanger = danger;
    if (finalDanger === undefined) {
      finalDanger = gasDetected || flameDetected || finalEmergency || (distance < 20);
      console.log('ℹ️  Calculating "danger" status on backend:', finalDanger);
    }

    // --- Basic validation: ensure all required fields are present ---
    const missingFields = [];
    if (temperature === undefined) missingFields.push('temperature');
    if (distance === undefined) missingFields.push('distance');
    if (gasValue === undefined) missingFields.push('gasValue');
    if (gasDetected === undefined) missingFields.push('gasDetected');
    if (flameDetected === undefined) missingFields.push('flameDetected');
    if (finalEmergency === undefined) missingFields.push('emergencyPressed');
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
    if (danger) {
      console.warn('⚠️  DANGER condition received from ESP32!');
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
