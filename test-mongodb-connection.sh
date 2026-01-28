#!/bin/bash

# MongoDB Connection Test Script for Doctor Channeling System
# This script helps verify MongoDB connectivity

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║           MongoDB Connection Test - Doctor Channeling System                ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a port is open
check_port() {
    local port=$1
    if nc -z localhost $port 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to check if Docker is running
check_docker() {
    if docker ps >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Checking System Requirements"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Docker is available
if check_docker; then
    echo -e "${GREEN}✓${NC} Docker is running"
    DOCKER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠${NC} Docker is not running (optional)"
    DOCKER_AVAILABLE=false
fi

# Check if MongoDB port is open
if check_port 27017; then
    echo -e "${GREEN}✓${NC} MongoDB port 27017 is accessible"
    MONGODB_RUNNING=true
else
    echo -e "${RED}✗${NC} MongoDB port 27017 is not accessible"
    MONGODB_RUNNING=false
fi

# Check if Backend port is open
if check_port 8080; then
    echo -e "${GREEN}✓${NC} Backend port 8080 is accessible"
    BACKEND_RUNNING=true
else
    echo -e "${YELLOW}⚠${NC} Backend port 8080 is not accessible (not started yet)"
    BACKEND_RUNNING=false
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. MongoDB Connection Strings"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$DOCKER_AVAILABLE" = true ] && docker ps | grep -q "doctor-channeling-mongodb"; then
    echo -e "${GREEN}Docker MongoDB is running${NC}"
    echo ""
    echo "MongoDB Compass Connection String:"
    echo "mongodb://admin:adminpass@localhost:27017/doctor_channeling?authSource=admin"
    echo ""
    CONNECTION_STRING="mongodb://admin:adminpass@localhost:27017/doctor_channeling?authSource=admin"
elif [ "$MONGODB_RUNNING" = true ]; then
    echo -e "${GREEN}Local MongoDB is running${NC}"
    echo ""
    echo "MongoDB Compass Connection String:"
    echo "mongodb://localhost:27017/doctor_channeling"
    echo ""
    CONNECTION_STRING="mongodb://localhost:27017/doctor_channeling"
else
    echo -e "${RED}MongoDB is not running${NC}"
    echo ""
    echo "Please start MongoDB using one of these methods:"
    echo ""
    echo "Option 1: Using Docker Compose (Recommended)"
    echo "  docker-compose up -d"
    echo ""
    echo "Option 2: Local MongoDB"
    echo "  mongod"
    echo ""
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Testing MongoDB Connection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test MongoDB connection using mongosh if available
if command -v mongosh &> /dev/null; then
    echo "Testing connection with mongosh..."
    if [ "$DOCKER_AVAILABLE" = true ] && docker ps | grep -q "doctor-channeling-mongodb"; then
        if mongosh "$CONNECTION_STRING" --eval "db.adminCommand('ping')" --quiet 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Successfully connected to MongoDB!"
            echo ""
            echo "Checking database..."
            mongosh "$CONNECTION_STRING" --eval "db.getName()" --quiet 2>/dev/null
            echo ""
            echo "Listing collections..."
            mongosh "$CONNECTION_STRING" --eval "db.getCollectionNames()" --quiet 2>/dev/null
        else
            echo -e "${RED}✗${NC} Failed to connect to MongoDB"
        fi
    else
        if mongosh "mongodb://localhost:27017/doctor_channeling" --eval "db.adminCommand('ping')" --quiet 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Successfully connected to MongoDB!"
            echo ""
            echo "Checking database..."
            mongosh "mongodb://localhost:27017/doctor_channeling" --eval "db.getName()" --quiet 2>/dev/null
            echo ""
            echo "Listing collections..."
            mongosh "mongodb://localhost:27017/doctor_channeling" --eval "db.getCollectionNames()" --quiet 2>/dev/null
        else
            echo -e "${RED}✗${NC} Failed to connect to MongoDB"
        fi
    fi
else
    echo -e "${YELLOW}⚠${NC} mongosh not found. Install MongoDB Shell to test connection."
    echo "Download from: https://www.mongodb.com/try/download/shell"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Backend Configuration Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "Backend/src/main/resources/application.properties" ]; then
    echo -e "${GREEN}✓${NC} application.properties found"
    echo ""
    echo "MongoDB Configuration:"
    grep "spring.data.mongodb" Backend/src/main/resources/application.properties
else
    echo -e "${RED}✗${NC} application.properties not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. Next Steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$BACKEND_RUNNING" = false ]; then
    echo "Start the Backend:"
    echo "  cd Backend"
    echo "  ./mvnw spring-boot:run"
    echo ""
fi

echo "Connect MongoDB Compass:"
echo "  1. Open MongoDB Compass"
echo "  2. Paste this connection string:"
echo "     $CONNECTION_STRING"
echo "  3. Click 'Connect'"
echo ""

echo "View Documentation:"
echo "  • README_MONGODB_SETUP.md - Quick start guide"
echo "  • MONGODB_CONNECTION_GUIDE.md - Comprehensive guide"
echo "  • MONGODB_COMPASS_CONNECTIONS.txt - Connection strings reference"
echo "  • ARCHITECTURE_DIAGRAM.md - System architecture"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$MONGODB_RUNNING" = true ]; then
    echo -e "${GREEN}✓${NC} MongoDB is accessible and ready to use"
    echo -e "${GREEN}✓${NC} Backend is properly configured"
    echo -e "${GREEN}✓${NC} You can now connect MongoDB Compass"
else
    echo -e "${RED}✗${NC} MongoDB is not running. Please start it first."
fi

echo ""
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
