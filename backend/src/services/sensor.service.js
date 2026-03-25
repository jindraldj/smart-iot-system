// -------------------------------------------------
// services/sensor.service.js
// Business logic layer — abstracts direct DB operations
// -------------------------------------------------
const Sensor = require('../models/sensor.model');

/**
 * saveSensorData
 * Creates and persists a new Sensor document in MongoDB.
 *
 * @param {object} data - Sensor payload from ESP32 HTTP POST body
 * @returns {Promise<SensorDocument>} - The newly created document
 */
const saveSensorData = async (data) => {
  // Mongoose create() both instantiates and saves the document in one call
  const sensor = await Sensor.create(data);
  return sensor;
};

/**
 * getLatestData
 * Fetches the single most-recently saved sensor reading.
 *
 * @returns {Promise<SensorDocument|null>} - Latest document or null if none exist
 */
const getLatestData = async () => {
  // Sort descending by createdAt, limit to 1 result
  const sensor = await Sensor.findOne().sort({ createdAt: -1 });
  return sensor;
};

module.exports = { saveSensorData, getLatestData };
