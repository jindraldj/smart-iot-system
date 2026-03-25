// // -------------------------------------------------
// // server.js
// // Entry point — connects to DB then starts HTTP server
// // -------------------------------------------------

// // Load environment variables from .env before anything else
// require('dotenv').config();

// const app = require('./app');
// const connectDB = require('./config/db');

// const PORT = process.env.PORT || 3000;

// /**
//  * Bootstrap function:
//  * 1. Connect to MongoDB
//  * 2. Start Express server only after DB is ready
//  */
// const start = async () => {
//   // Step 1: Connect to MongoDB
//   await connectDB();

//   // Step 2: Start listening for HTTP requests
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${PORT}`);
//     console.log(`📡 POST sensor data → http://localhost:${PORT}/api/sensor`);
//     console.log(`📊 GET latest data  → http://localhost:${PORT}/api/sensor/latest`);
//   });
// };

// // Run the bootstrap and catch any startup errors
// start().catch((err) => {
//   console.error('❌ Server startup failed:', err.message);
//   process.exit(1);
// });
// -------------------------------------------------
// server.js
// Entry point — connects to DB then starts HTTP server
// -------------------------------------------------

require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

const start = async () => {

  // Step 1: Connect to MongoDB
  await connectDB();

  // Step 2: Start server (IMPORTANT CHANGE HERE)
  app.listen(PORT, '0.0.0.0', () => {

    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);

    // 👉 Replace localhost with actual IP manually
    console.log(`📡 POST sensor data → http://<YOUR-IP>:${PORT}/api/sensor`);
    console.log(`📊 GET latest data  → http://<YOUR-IP>:${PORT}/api/sensor/latest`);
  });
};

start().catch((err) => {
  console.error('❌ Server startup failed:', err.message);
  process.exit(1);
});