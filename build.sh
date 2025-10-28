#!/bin/bash

# This script runs during Vercel build to inject environment variables

echo "Building AI Coding Tutor..."

# Copy files to output directory
mkdir -p public
cp index.html public/
cp app.js public/

# If GEMINI_API_KEY environment variable exists, replace it in the HTML
if [ ! -z "$GEMINI_API_KEY" ]; then
    echo "Injecting Gemini API key from environment variable..."
    sed -i "s/REPLACE_WITH_YOUR_GEMINI_API_KEY/$GEMINI_API_KEY/g" public/index.html
else
    echo "Warning: GEMINI_API_KEY environment variable not set!"
fi

echo "Build complete!"