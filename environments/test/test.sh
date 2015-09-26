#!/bin/bash

# Do not run this script with npm test on CI.
# npm test always returns zero exit code even when tests fail.

# Exit on first command that fails
set -e

DIR=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
cd $DIR
cd ../../app/meteor/

echo "** Running ESLint"
eslint .
echo -e "ESLint checks were successful.\n"

echo -e "** Killing node processes\n"
pkill -9 node || true

export VELOCITY_CI=1
export JASMINE_CLIENT_UNIT=1
export JASMINE_SERVER_INTEGRATION=1
export JASMINE_BROWSER=chrome
export SELENIUM_BROWSER=chrome

echo -e "** Running test suite\n"
meteor --test --settings ../../environments/test/settings.json
