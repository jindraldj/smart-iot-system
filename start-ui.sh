#!/bin/bash
echo "======================================================="
echo "         STARTING FRONTEND UI (Angular)"
echo "======================================================="

cd "$(dirname "$0")/frontend" || exit
echo "Compiling and starting Angular app on port 4200..."
npm start
