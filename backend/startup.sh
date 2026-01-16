#!/bin/bash
set -e

echo "Performing database migrations..."
npx prisma migrate deploy

echo "Starting the application..."
node dist/index.js