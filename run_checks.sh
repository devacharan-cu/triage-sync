#!/bin/bash
set -e
echo "Running lint..."
npm run lint
echo "Running tests..."
npm run test -- run
echo "Running build..."
npm run build
