// -------------------------------------------------
// config/db.js
// Establishes a connection to MongoDB using Mongoose
// -------------------------------------------------
const mongoose = require('mongoose');

/**
 * connectDB - Connects to MongoDB using the MONGO_URI from .env
 * Called once at server startup (server.js)
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Exit process with failure so the server doesn't run without a DB
    process.exit(1);
  }
};

module.exports = connectDB;
