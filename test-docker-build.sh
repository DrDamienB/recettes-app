#!/bin/bash

# Script pour tester le build Docker localement
echo "Building Docker image..."
docker build -t recettes-app-test . --no-cache

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "To run the container:"
    echo "docker run -p 3000:3000 -v recettes-data:/data recettes-app-test"
else
    echo "❌ Build failed!"
    exit 1
fi
