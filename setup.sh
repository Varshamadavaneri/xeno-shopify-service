#!/bin/bash

# Xeno Shopify Data Ingestion & Insights Service Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up Xeno Shopify Data Ingestion & Insights Service..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

echo "✅ PostgreSQL is installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

echo "✅ Dependencies installed successfully"

# Set up environment file
if [ ! -f "server/.env" ]; then
    echo "⚙️  Setting up environment configuration..."
    cp server/config.env.example server/.env
    echo "✅ Environment file created at server/.env"
    echo "⚠️  Please edit server/.env with your database credentials and other settings"
else
    echo "✅ Environment file already exists"
fi

# Create database if it doesn't exist
echo "🗄️  Setting up database..."
if psql -lqt | cut -d \| -f 1 | grep -qw xeno_shopify_db; then
    echo "✅ Database 'xeno_shopify_db' already exists"
else
    echo "Creating database 'xeno_shopify_db'..."
    createdb xeno_shopify_db
    echo "✅ Database created successfully"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit server/.env with your database credentials and other settings"
echo "2. Start the application with: npm run dev"
echo "3. Access the frontend at: http://localhost:3000"
echo "4. Access the backend API at: http://localhost:5000"
echo ""
echo "For more information, see README.md"
