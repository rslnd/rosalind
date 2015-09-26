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

# Now don't exit if test commands fail
set +e

mkdir -p ~/clone/app/meteor/.meteor/local/log
meteor --test --settings ../../environments/test/settings.json

if [ $? -eq 0 ]; then
  echo -e "\n** ✅ Yay! All tests completed successfully"
  exit 0
else
  set -e
  echo -e "\n"
  echo "** ⛔️ Oh no, some tests failed"
  echo -e "** Here are the log files\n"
  cd ~/clone/app/meteor/.meteor/local/log/
  tail -n +1 *
  exit 1
fi
