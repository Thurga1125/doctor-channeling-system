#!/bin/bash

# Doctor Channeling System - Local Deployment Script
# Run this script to deploy the application locally

echo "Starting Doctor Channeling System deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker Desktop first."
    echo "Download from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "Error: Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "Docker is running. Building and starting containers..."

# Stop any existing containers
docker-compose down 2>/dev/null

# Build and start the containers
docker-compose up -d --build

echo ""
echo "Waiting for services to start..."
sleep 30

echo ""
echo "============================================"
echo "  Doctor Channeling System is now running!"
echo "============================================"
echo ""
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8080/api"
echo ""
echo "  To stop: docker-compose down"
echo "  To view logs: docker-compose logs -f"
echo "============================================"
