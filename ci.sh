#!/bin/bash

set -e

ANSI_RED="\033[31;1m"
ANSI_RESET="\033[0m"

export COMMIT_HASH="${TRAVIS_COMMIT:-$CIRCLE_SHA1}"
export BUILD_NUMBER="${TRAVIS_JOB_NUMBER:-$CIRCLE_BUILD_NUM}"
export ARTIFACTS_PATH="${CIRCLE_ARTIFACTS:-"/tmp/artifacts"}"
export BRANCH="${TRAVIS_BRANCH:-$CIRCLE_BRANCH}"
echo "[CI] Build $BUILD_NUMBER of commit ${COMMIT_HASH:0:7}"

export NPM_VERSION=5.2.0

export NPM_CONFIG_LOGLEVEL=warn
export METEOR_PRETTY_OUTPUT=0
export METEOR_WATCH_FORCE_POLLING=true
export METEOR_WATCH_POLLING_INTERVAL_MS=1800000

retry() {
  local result=0
  local count=1
  while [ $count -le 3 ]; do
    [ $result -ne 0 ] && {
      echo -e "\n${ANSI_RED}The command \"$@\" failed. Retrying, $count of 3.${ANSI_RESET}\n" >&2
    }
    "$@"
    result=$?
    [ $result -eq 0 ] && break
    count=$(($count + 1))
    sleep 1
  done

  [ $count -gt 3 ] && {
    echo -e "\n${ANSI_RED}The command \"$@\" failed 3 times.${ANSI_RESET}\n" >&2
  }

  return $result
}

case "$1" in
  install)
    echo "Setting up CI environment"
    SECONDS=0
    npm -g install npm@$NPM_VERSION &

    npm set registry https://registry.npmjs.org/
    npm -g install yarn
    mkdir -p $ARTIFACTS_PATH

    echo "npm $(npm --version)"
    echo "node $(node --version)"

    echo "[CI] Machine environment setup took $SECONDS seconds"

    # Install meteor
    echo "[CI] Installing meteor"
    echo -en "travis_fold:start:meteor\r"
    SECONDS=0

    if [ -d ~/.meteor ]; then sudo ln -s ~/.meteor/meteor /usr/local/bin/meteor; fi

    if [ ! -e $HOME/.meteor/meteor ]; then
      METEOR_INSTALL_URL="https://install.meteor.com/"
      echo "Installing latest meteor from $METEOR_INSTALL_URL"

      touch $ARTIFACTS_PATH/meteor_installation.log
      curl -o install_meteor.sh $METEOR_INSTALL_URL
      chmod +x install_meteor.sh
      ./install_meteor.sh
    fi

    echo -en "travis_fold:end:meteor\r"
    echo "[CI] Meteor installation took $SECONDS seconds"

    # Installing npm dependencies
    echo "[CI] Installing dependencies from npm"
    echo -en "travis_fold:start:install_dependencies\r"
    SECONDS=0

    echo "[CI] Installing meteor npm dependencies"
    cd app/meteor
    yarn
    cd -

    echo -en "travis_fold:end:install_dependencies\r"
    echo "[CI] Dependencies installation from npm took $SECONDS seconds"
    ;;

  test)
    echo "[CI] Running test suite"
    # Run unit tests
    yarn run test
    ;;

  build)
    echo -en "travis_fold:start:build\r"
    cd production/
    chmod +x prepare.sh
    ./prepare.sh
    retry ./build.sh
    echo -en "travis_fold:end:build\r"

    echo -en "travis_fold:start:image\r"
    retry ./image.sh
    echo -en "travis_fold:end:image\r"

    echo -en "travis_fold:start:push\r"
    retry ./push.sh
    echo -en "travis_fold:end:push\r"

    echo "** Done!"
    ;;

  deploy)
    chmod +x production/deploy.sh
    production/deploy.sh
    ;;

  *)
    echo "Usage: $0 (test|build) -- unknown command '$1'"
    exit 1
esac
