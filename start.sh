#!/bin/bash

# This script is used for starting the application on Render.com
# It checks for environment variables and sets defaults if needed

# Check if PORT is set, otherwise default to 10000
if [ -z "$PORT" ]; then
  export PORT=10000
  echo "PORT not set, using default: 10000"
fi

# Check if SESSION_SECRET is set, generate a random one if not
if [ -z "$SESSION_SECRET" ]; then
  export SESSION_SECRET=$(openssl rand -hex 32)
  echo "SESSION_SECRET not set, generated a random one"
fi

# Start the application
echo "Starting Twitch Autofarm Dashboard..."
npm start