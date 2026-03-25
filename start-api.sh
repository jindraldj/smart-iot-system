#!/bin/bash
echo "======================================================="
echo "         STARTING BACKEND API (Node.js + MongoDB)"
echo "======================================================="

# Assume MongoDB is either running as a service or we start it here.
# Assuming it's running as a service: systemctl start mongod 
# OR we can just start the node layer:

cd "$(dirname "$0")/backend" || exit
echo "Starting Node.js API on port 3000..."
npm run dev
