#!/bin/bash

# Exit on first command that fails
set -e

cd ../../../../

echo -e "Running ESLint..."
eslint .
echo -e "ESLint checks were successful.\n"

echo -e "Killing node processes...\n"
pkill -9 node || true

export VELOCITY_CI=1
export JASMINE_CLIENT_UNIT=1
export JASMINE_SERVER_INTEGRATION=1
export JASMINE_BROWSER=chrome
export SELENIUM_BROWSER=chrome

echo -e "Running test suite...\n"
meteor --test --settings ../environments/test/settings.json
