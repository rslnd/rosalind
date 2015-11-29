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

prepare() {
  echo "** Installed: $(meteor --version)"
  cd_app
  REQUIRED_METEOR_VERSION=$(cat meteor/.meteor/release)
  REQUIRED_METEOR_VERSION=${REQUIRED_METEOR_VERSION:7}
  REQUIRED_METEOR_VERSION+="_1"
  RELEASE="--release velocity:METEOR@$REQUIRED_METEOR_VERSION"
  RELEASE=""

  echo -e "** Using: $(meteor --version $RELEASE) \n"

  clear_logs
}

# Run Linters
test_lint () {
  cd_app
  cd ../
  echo "** Running ESLint"
  node ./node_modules/eslint/bin/eslint.js .
  echo -e "ESLint checks were successful.\n"

  echo "** Running CoffeeLint"
  ./node_modules/coffeelint/bin/coffeelint .
  echo -e "\n\n"
}

# Kill node and java processes
kill_zombies () {
  sleep 1
  echo -e "** Killing node and java processes\n"
  pkill -9 node || true
  pkill -f 'java -jar' || true
}

clear_logs() {
  cd_app
  mkdir -p meteor/.meteor/local/log
  cd meteor/.meteor/local/log/
  rm -rf *
  cd_app
}

print_logs() {
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
  export CUCUMBER_TAIL=1
  export NODE_ENV="test"
  export METEOR_ENV="test"

  echo -e "** Running integration test suite\n"
  set +e

  meteor $RELEASE --test --settings ../../environments/test/settings.json

  if [ $? -eq 0 ]; then
    echo -e "\n** Meteor integration test suite completed successfully\n"
    set -e
    return 0
  else
    echo -e "\n** Meteor integration test suite failed\n"
    set -e
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
  set +e

  meteor $RELEASE --test --settings ../../environments/test/settings.json

  if [ $? -eq 0 ]; then
    echo -e "\n** Meteor unit tests completed successfully\n"
    set -e
    return 0
  else
    echo -e "\n** Meteor unit tests failed\n"
    set -e
    return 1
  fi
}

# Run test suite in different browsers
test_all () {
  clear_logs

  test_lint

  test_meteor_jasmine || fail
  test_meteor_selenium || fail

  kill_zombies

  print_logs

  exit $STATUS
}


STATUS=0
fail () {
  STATUS=1
}

if [ -n "$CACHE_PACKAGES" ]; then
  echo -e "** Starting Meteor to cache packages\n"

  prepare
  cd_app
  cd meteor/

  meteor $RELEASE --raw-logs --settings ../../environments/test/settings.json
fi

if [ -n "$CI" ]; then
  echo "** Running test suite on CI"
  echo "** This is matrix node $MATRIX_NODE"

  prepare

  case $MATRIX_NODE in
  SELENIUM)
    test_meteor_selenium
    ;;
  JASMINE)
    test_meteor_jasmine
    ;;
  LINT)
    test_lint
    ;;
  *)
    echo "** Parallelized testing for $MATRIX_NODE matrix nodes is not implemented yet"
    exit 0
    ;;
  esac

  print_logs

  exit $STATUS

else
  echo -e "** Running full test suite on local machine\n"
  prepare
  test_all
fi
