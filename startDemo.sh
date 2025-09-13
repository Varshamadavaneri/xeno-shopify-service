#!/bin/bash

echo "🚀 Starting Xeno Shopify Data Ingestion & Insights Service Demo"
echo "=============================================================="

# Kill any existing processes
echo "🔄 Cleaning up existing processes..."
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
sleep 2

# Start backend server
echo "🖥️  Starting backend server..."
cd server
rm -f database.sqlite
PORT=5001 node index.js &
BACKEND_PID=$!
sleep 5

# Check if backend is running
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Backend server started successfully on port 5001"
    
    # Setup demo data
    echo "📊 Setting up demo data..."
    node scripts/simpleDemoSetup.js
    
    # Start frontend
    echo "🌐 Starting frontend..."
    cd ../client
    BROWSER=none npm start &
    FRONTEND_PID=$!
    sleep 10
    
    echo ""
    echo "🎉 Demo is ready!"
    echo "=================="
    echo "Frontend: http://localhost:3000"
    echo "Backend:  http://localhost:5001"
    echo ""
    echo "Demo Login Credentials:"
    echo "Email:    demo@xeno.com"
    echo "Password: demo123"
    echo ""
    echo "Press Ctrl+C to stop the demo"
    echo ""
    
    # Wait for user to stop
    wait $FRONTEND_PID
else
    echo "❌ Failed to start backend server"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi
