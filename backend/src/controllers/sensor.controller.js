// -------------------------------------------------
// controllers/sensor.controller.js
// Handles HTTP request/response for sensor endpoints
// -------------------------------------------------
const { saveSensorData, getLatestData } = require('../services/sensor.service');
const { sendSuccess, sendError } = require('../utils/response.util');
const { db, isInitialized } = require('../config/firebase');

/** Throttle noisy “no data yet” logs from dashboard polling (1 req/sec). */
let lastGetLatestEmptyLogMs = 0;

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
    // ─── BEFORE: prove the HTTP POST hit this handler and the body was parsed ───
    console.log('\n========== [ESP32 POST] BEFORE ==========');
    console.log('  time (ISO):     ', new Date().toISOString());
    console.log('  method / url:   ', req.method, req.originalUrl);
    console.log('  content-type:   ', req.get('content-type') || '(missing)');
    console.log('  client IP:      ', req.ip || req.socket?.remoteAddress);
    console.log('  body (string):  ', JSON.stringify(req.body));
    console.log('=========================================\n');

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
      console.warn('[ESP32 POST] REJECTED — missing fields:', missingFields);
      console.warn('[ESP32 POST] body was:', JSON.stringify(req.body));
      return sendError(
        res,
        400,
        `Missing required fields: ${missingFields.join(', ')}`
      );
    }

    console.log('[ESP32 POST] validated payload →', {
      temperature,
      distance,
      gasValue,
      gasDetected,
      flameDetected,
      emergencyPressed: finalEmergency,
      danger: finalDanger,
    });

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

    // --- Save to Firebase if initialized ---
    if (isInitialized && db) {
      try {
        const sensorData = {
          temperature,
          distance,
          gasValue,
          gasDetected,
          flameDetected,
          emergencyPressed: finalEmergency,
          danger: finalDanger,
          timestamp: new Date().toISOString(),
          deviceId: 'esp32-bus-001', // You can make this dynamic
          location: 'Bus-A' // You can make this dynamic
        };

        // Save to Firestore
        await db.collection('sensorReadings').add(sensorData);
        console.log('✅ Data saved to Firebase Firestore');

        // Also save to Realtime Database for real-time updates
        const realtimeRef = db.app.database().ref('sensorData/latest');
        await realtimeRef.set(sensorData);
        console.log('✅ Data saved to Firebase Realtime Database');
      } catch (firebaseError) {
        console.error('❌ Firebase save error:', firebaseError.message);
        // Don't fail the request if Firebase fails, MongoDB already worked
      }
    }

    // ─── AFTER: prove MongoDB accepted the document ───
    const plain =
      typeof savedData?.toObject === 'function'
        ? savedData.toObject()
        : savedData;
    console.log('\n========== [ESP32 POST] AFTER (saved) ==========');
    console.log('  mongo _id:      ', plain?._id);
    console.log('  createdAt:      ', plain?.createdAt);
    console.log('  snapshot:       ', JSON.stringify(plain));
    if (finalDanger) {
      console.warn('  ⚠️ danger flag true');
    }
    console.log('===============================================\n');

    return sendSuccess(res, 201, 'Sensor data saved successfully', savedData);
  } catch (error) {
    console.error('[ESP32 POST] EXCEPTION:', error.message);
    console.error(error.stack);
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
      const now = Date.now();
      if (now - lastGetLatestEmptyLogMs > 10000) {
        lastGetLatestEmptyLogMs = now;
        console.log(
          '[GET /latest] still no documents in Sensor collection (waiting for ESP32 POST or check MongoDB)'
        );
      }
      return sendSuccess(res, 200, 'No sensor data found yet', null);
    }

    return sendSuccess(res, 200, 'Latest sensor data retrieved', data);
  } catch (error) {
    console.error('getLatestSensorData error:', error.message);
    return sendError(res, 500, 'Internal server error');
  }
};

module.exports = { postSensorData, getLatestSensorData };
