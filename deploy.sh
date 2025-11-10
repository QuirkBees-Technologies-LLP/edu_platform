#!/bin/bash

# Install dependencies
npm install --production

# Build the app
npm run build

# Copy files
cp -r dist/* $DEPLOYMENT_TARGET/
cp server.js $DEPLOYMENT_TARGET/
cp package.json $DEPLOYMENT_TARGET/
cp web.config $DEPLOYMENT_TARGET/

# Install production dependencies in target
cd $DEPLOYMENT_TARGET
npm install --production
