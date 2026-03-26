#!/bin/bash
# Run this script manually to install test dependencies:
# chmod +x install-test-deps.sh && ./install-test-deps.sh

cd "$(dirname "$0")"

echo "Installing test dependencies..."
npm install --save-dev \
  jest@^30.3.0 \
  supertest@^7.2.2 \
  ts-jest@^29.4.6 \
  @types/jest@^30.0.0 \
  @types/supertest@^7.2.0

echo "Done! Run: npm test"
