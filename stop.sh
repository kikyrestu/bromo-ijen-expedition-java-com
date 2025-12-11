#!/bin/bash

# Stop all PM2 processes
pm2 stop all

# Delete all PM2 processes
pm2 delete all

# Clear logs
pm2 flush

echo "All PM2 processes have been stopped and cleared"
