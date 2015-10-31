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
test_meteor_selenium () {
  cd_app
  cd meteor/
  kill_zombies

  export CUCUMBER=1
  export SELENIUM_BROWSER="chrome"

  export JASMINE_SERVER_UNIT=0
  export JASMINE_SERVER_INTEGRATION=0
  export JASMINE_CLIENT_UNIT=0
  export JASMINE_CLIENT_INTEGRATION=0

  export VELOCITY_CI=1
  export NODE_ENV="test"
  export METEOR_ENV="test"

  echo -e "** Running integration test suite\n"

  mkdir -p .meteor/local/log
  meteor --test --settings ../../environments/test/settings.json

  if [ $? -eq 0 ]; then
    echo -e "\n** Yay! Meteor integration test suite completed successfully\n"
    return 0
  else
    echo -e "\n** Yay! Meteor integration test suite failed\n"
    return 1
  fi
}

test_meteor_jasmine () {
  cd_app
  cd meteor/
  kill_zombies

  export JASMINE_SERVER_INTEGRATION=1
  export JASMINE_BROWSER="PhantomJS"

  export JASMINE_SERVER_UNIT=0
  export JASMINE_CLIENT_UNIT=0
  export JASMINE_CLIENT_INTEGRATION=0
  export CUCUMBER=0

  export VELOCITY_CI=1
  export NODE_ENV="test"
  export METEOR_ENV="test"

  echo -e "** Running unit test suite\n"

  mkdir -p .meteor/local/log
  meteor --test --settings ../../environments/test/settings.json

  if [ $? -eq 0 ]; then
    echo -e "\n** Meteor unit tests completed successfully\n"
    return 0
  else
    echo -e "\n** Meteor unit tests failed\n"
    return 1
  fi
}

# Run test suite in different browsers
test_all () {
  test_eslint

  test_meteor_jasmine || fail
  test_meteor_selenium || fail

  kill_zombies

  if [ "$STATUS" == "0" ]; then
    echo -e "\n\n** Yay! All tests completed successfully"
  else
    set -e
    echo "** Oh no, some tests failed"
    echo -e "\n"
    echo "** Oh no, some scenarios failed"
    echo -e "** Here are the log files\n"
    cd .meteor/local/log/
    tail -n +1 *
  fi

  exit $STATUS
}


STATUS=0
fail () {
  STATUS=1
}

test_all
