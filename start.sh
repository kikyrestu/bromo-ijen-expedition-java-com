#!/bin/bash

# Stop any existing PM2 processes
pm2 delete all || true

# Install dependencies if needed
npm install

# Build the application
npm run build

# Start the application with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Generate startup script
pm2 startup

# Save PM2 process list for startup
pm2 save

# Display logs
pm2 logs
