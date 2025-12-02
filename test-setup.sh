#!/bin/bash

# Test script for the setup wizard
# This simulates user input

echo "Testing ShipNative Setup Script..."
echo ""

# Create a temporary test response file
cat > /tmp/setup-test-input.txt << 'RESPONSES'
My Test App
mytestapp
com.test.mytestapp
mytestapp
n
n
n
n
n
n
n
n
n
RESPONSES

# Run setup with test input
node setup.js < /tmp/setup-test-input.txt

# Clean up
rm /tmp/setup-test-input.txt

echo ""
echo "Test complete!"
echo ""
echo "Checking results..."
echo ""

# Check if app.json was updated
echo "1. Checking app.json..."
if grep -q "My Test App" apps/app/app.json; then
    echo "   ✅ app.json updated with display name"
else
    echo "   ❌ app.json NOT updated"
fi

if grep -q "com.test.mytestapp" apps/app/app.json; then
    echo "   ✅ app.json updated with bundle ID"
else
    echo "   ❌ Bundle ID NOT updated"
fi

# Check if package.json was updated
echo ""
echo "2. Checking apps/app/package.json..."
if grep -q "mytestapp" apps/app/package.json; then
    echo "   ✅ package.json updated with project name"
else
    echo "   ❌ package.json NOT updated"
fi

# Check if .env was created
echo ""
echo "3. Checking .env file..."
if [ -f "apps/app/.env" ]; then
    echo "   ⚠️  .env file created (unexpected - all services were skipped)"
    rm apps/app/.env
else
    echo "   ✅ No .env file (correct - all services were skipped)"
fi

echo ""
echo "========================================="
echo "Test Summary:"
echo "========================================="
echo "The setup script should have:"
echo "  • Updated app.json with 'My Test App'"
echo "  • Updated app.json with bundle ID"
echo "  • Updated package.json with 'mytestapp'"
echo "  • NOT created .env (all services skipped)"
echo ""
