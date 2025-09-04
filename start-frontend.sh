#!/bin/bash

# Script to start the React frontend
echo "Starting React frontend server..."
cd "$(dirname "$0")/frontend"
npm start
