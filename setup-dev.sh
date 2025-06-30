#!/bin/bash

echo "Setting up development environment..."

# Install MongoDB if not present
if ! command -v mongod &> /dev/null; then
    echo "Installing MongoDB..."
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
fi

# Create MongoDB data directory
mkdir -p /tmp/mongodb-data

# Start MongoDB
mongod --dbpath /tmp/mongodb-data --port 27017 --fork --logpath /tmp/mongodb.log

echo "MongoDB started on port 27017"

# Install backend dependencies
cd backend
npm install

echo "Development environment setup complete!"
echo "Run 'npm start' in the backend directory to start the server"