#!/bin/bash

echo "🔧 Quick Authentication Fix Script"
echo "=================================="

# Kill any existing processes on port 5001
echo "1. Cleaning up existing processes..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || echo "No processes to kill"

# Start a simple MongoDB instance
echo "2. Starting MongoDB..."
mkdir -p /tmp/mongodb-data
mongod --dbpath /tmp/mongodb-data --port 27017 --fork --logpath /tmp/mongodb.log 2>/dev/null || echo "MongoDB may already be running"

# Install backend dependencies if needed
echo "3. Installing backend dependencies..."
cd backend
npm install --silent

# Start the backend server
echo "4. Starting backend server..."
npm start &
BACKEND_PID=$!

# Wait for server to start
echo "5. Waiting for server to start..."
sleep 5

# Test the authentication
echo "6. Testing authentication..."
cd ..
node test-auth.js

echo ""
echo "🎯 Quick fixes applied!"
echo "Backend PID: $BACKEND_PID"
echo "To stop backend: kill $BACKEND_PID"
echo ""
echo "Next steps:"
echo "1. Configure Google OAuth credentials in backend/.env"
echo "2. Start frontend with: cd frontend && npm run dev"
echo "3. Test login at http://localhost:3000/login"