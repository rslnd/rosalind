#!/bin/bash

# Do not run this script with npm test on CI.
# npm test always returns zero exit code even when tests fail.

# Exit on first command that fails
set -e

# Change to source code directory
DIR=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
cd_app () {
  cd $DIR
  cd ../../app/
}

# Run ESLint checks
test_eslint () {
  cd_app
  cd ../
  echo "** Running ESLint"
  eslint .
  echo -e "ESLint checks were successful.\n"
}

# Kill node and java processes
kill_zombies () {
  sleep 1
  echo -e "** Killing node and java processes\n"
  pkill -9 node || true
  pkill -f 'java -jar' || true
}

# Run Meteor test suite
# Be sure to set BROWSER before calling
test_meteor () {
  cd_app
  cd meteor/
  kill_zombies
  export VELOCITY_CI=1
  export JASMINE_CLIENT_UNIT=1
  export JASMINE_SERVER_INTEGRATION=1
  export JASMINE_BROWSER="$BROWSER"
  export SELENIUM_BROWSER="$BROWSER"
  export NODE_ENV="test"
  export METEOR_ENV="test"

  echo -e "** Running test suite in $BROWSER\n"

  mkdir -p .meteor/local/log
  meteor --test --settings ../../environments/test/settings.json

  if [ $? -eq 0 ]; then
    echo -e "\n** Yay! Meteor test suite in $BROWSER completed successfully\n"
    return 0
  else
    set -e
    echo -e "\n"
    echo "** Oh no, some tests failed in $BROWSER"
    echo -e "** Here are the log files\n"
    cd .meteor/local/log/
    tail -n +1 *
    return 1
  fi
}

# Run test suite in different browsers
test_all () {
  test_eslint

  BROWSER="firefox" && test_meteor || fail

  BROWSER="chrome" && test_meteor || fail

  kill_zombies

  if [ "$STATUS" == "0" ]; then
    echo -e "\n\n** Yay! All tests completed successfully"
  else
    echo "** Oh no, some tests failed"
    echo "** $MESSAGE"
  fi

  exit $STATUS
}


STATUS=0
MESSAGE=""
fail () {
  STATUS=1
  MESSAGE="[failed: $BROWSER] $MESSAGE"
}

test_all
