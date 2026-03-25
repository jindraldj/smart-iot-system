// -------------------------------------------------
// models/sensor.model.js
// Mongoose schema & model for ESP32 sensor readings
// -------------------------------------------------
const mongoose = require('mongoose');

/**
 * SensorSchema - Defines the structure of each sensor document in MongoDB
 *
 * Fields:
 *  temperature      - Ambient temperature reading (°C)
 *  distance         - Ultrasonic distance reading (cm)
 *  gasValue         - Raw analog gas sensor value (ADC units)
 *  gasDetected      - True if gas concentration exceeds threshold
 *  flameDetected    - True if flame/IR sensor triggers
 *  emergencyPressed - True if physical emergency button is pressed
 *  danger           - True if any critical condition is active
 *  createdAt        - Auto-set timestamp of when the record was saved
 */
const SensorSchema = new mongoose.Schema(
  {
    temperature: {
      type: Number,
      required: [true, 'Temperature is required'],
    },
    distance: {
      type: Number,
      required: [true, 'Distance is required'],
    },
    gasValue: {
      type: Number,
      required: [true, 'Gas value is required'],
    },
    gasDetected: {
      type: Boolean,
      required: [true, 'gasDetected flag is required'],
    },
    flameDetected: {
      type: Boolean,
      required: [true, 'flameDetected flag is required'],
    },
    emergencyPressed: {
      type: Boolean,
      required: [true, 'emergencyPressed flag is required'],
    },
    danger: {
      type: Boolean,
      required: [true, 'danger flag is required'],
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// Export the compiled Mongoose model
module.exports = mongoose.model('Sensor', SensorSchema);
