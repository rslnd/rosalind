#!/bin/sh

# Exit on first command that fails
set -e

cd ../../app/

echo "** Running ESLint"
eslint .
echo "ESLint checks were successful.\n"

echo "** Killing node processes\n"
pkill -9 node || true

export VELOCITY_CI=1
export JASMINE_CLIENT_UNIT=1
export JASMINE_SERVER_INTEGRATION=1
export JASMINE_BROWSER=chrome
export SELENIUM_BROWSER=chrome

echo "** Running test suite\n"
meteor --test --settings ../environments/test/settings.json
