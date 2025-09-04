#!/bin/bash

# Script to start the Flask backend
echo "Starting Flask backend server..."
cd "$(dirname "$0")"
source ../.venv/bin/activate
cd backend
python app.py
