#!/bin/bash

# Set deployment target if not set
DEPLOYMENT_TARGET=${DEPLOYMENT_TARGET:-/home/site/wwwroot}

# Install dependencies
npm install --production

# Build the app
npm run build

# Ensure target directory exists
mkdir -p $DEPLOYMENT_TARGET

# Copy files
cp -r dist/* $DEPLOYMENT_TARGET/
cp server.js $DEPLOYMENT_TARGET/
cp package.json $DEPLOYMENT_TARGET/
cp web.config $DEPLOYMENT_TARGET/

# Install production dependencies in target
cd $DEPLOYMENT_TARGET
npm install --production
