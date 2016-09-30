#!/bin/bash

set -e

YML="-f docker-compose.yml -f docker-compose.test.yml"

ANSI_RED="\033[31;1m"
ANSI_RESET="\033[0m"

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
    sudo apt-get -y install xvfb oracle-java8-installer &
    { curl -L https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-`uname -s`-`uname -m` > docker-compose; } &
    npm -g install npm@$NPM_VERSION &
    wait
    npm set registry https://registry.npmjs.org/
    chmod +x docker-compose && sudo mv docker-compose /usr/local/bin
    java -version
    export DISPLAY=:99.0
    /sbin/start-stop-daemon --start --quiet --pidfile /tmp/custom_xvfb_99.pid --make-pidfile --background --exec /usr/bin/Xvfb -- :99 -ac -screen 0 1280x1024x16
    curl -Lo travis_after_all.py https://raw.githubusercontent.com/dmakhno/travis_after_all/master/travis_after_all.py
    npm install -g npm-install-retry
    echo "[CI] Machine environment setup took $SECONDS seconds"
    ;;

  test)
    if [ -z "$ROOT_URL" ]; then
      echo "Please set ROOT_URL for running integration tests"
      exit 1
    fi

    # Install meteor
    echo "[CI] Installing meteor"
    echo -en "travis_fold:start:meteor\r"
    SECONDS=0

    RELEASE=`cat app/meteor/.meteor/release`
    RELEASE="${RELEASE:7}"

    curl "https://install.meteor.com/?release=${RELEASE}" | /bin/sh

    echo -en "travis_fold:end:meteor\r"
    echo "[CI] Meteor installation took $SECONDS seconds"

    # Installing npm dependencies
    echo "[CI] Installing dependencies from npm"
    echo -en "travis_fold:start:install_dependencies\r"
    SECONDS=0

    npm-install-retry --wait 500 --attempts 10 -- --progress=false --depth=0

    cd app/meteor/tests/cucumber
    npm-install-retry --wait 500 --attempts 10 -- --progress=false --depth=0
    cd -

    cd app/meteor
    meteor npm i --progress=false
    cd -

    echo -en "travis_fold:end:install_dependencies\r"
    echo "[CI] Dependencies installation took $SECONDS seconds"

    # Run unit tests
    echo -en "travis_fold:start:unit_tests\r"
    npm test
    echo -en "travis_fold:end:unit_tests\r"

    # Start environment for acceptance tests
    echo "[CI] Starting environment for acceptance tests"
    echo -en "travis_fold:start:start_meteor\r"
    SECONDS=0
    RETRY=0

    export TEST=true
    cd app/meteor
    meteor &
    METEOR_PID=$!

    for i in {1..2700}; do
      printf "(%03d) " $i && curl -q "$ROOT_URL" && break;
      if [ "$SECONDS" -ge 900 ]; then
        RETRY=$((RETRY + 1))
        SECONDS=0
        echo "[CI] Warning: Timed out while waiting for meteor to start"
        kill $METEOR_PID
        meteor &
        METEOR_PID=$!
      fi;

      if [ "$RETRY" -ge 3 ]; then
        echo "[CI] Error: Timed out while waiting for meteor to start after $RETRY retries. Failing tests."
        exit 1
      fi;
      sleep 3
    done;
    echo -en "travis_fold:end:start_meteor\r"
    if [ "$RETRY" -ge 1 ]; then
      echo "[CI] Dependencies installation took $SECONDS seconds after $RETRY retries"
    else
      echo "[CI] Dependencies installation took $SECONDS seconds"
    fi;

    # Run acceptance tests
    echo "[CI] Running acceptance tests"
    echo -en "travis_fold:start:acceptance_tests\r"
    SECONDS=0
    export SAUCE_NAME="Rosalind build $TRAVIS_JOB_NUMBER of commit ${TRAVIS_COMMIT:0:6}"
    export SAUCE_TUNNEL_ID="$TRAVIS_JOB_NUMBER"
    export BUILD_NUMBER="$TRAVIS_BUILD_NUMBER"
    retry npm run test:acceptance
    echo -en "travis_fold:end:acceptance_tests\r"
    echo "[CI] Acceptance tests took $SECONDS seconds"
    ;;

  build)
    sudo pkill sc

    echo -en "travis_fold:start:pull\r"
    retry docker-compose $YML pull meteor
    echo -en "travis_fold:end:pull\r"

    echo -en "travis_fold:start:dependencies\r"
    retry docker-compose $YML run --no-deps meteor meteor npm install --progress=false --depth=0
    echo -en "travis_fold:end:dependencies\r"

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

  after_success)
    python travis_after_all.py
    export $(cat .to_export_back) > /dev/null 2>&1
    if [ "$BUILD_LEADER" = "YES" ]; then
      if [ "$BUILD_AGGREGATE_STATUS" = "others_succeeded" ]; then
        echo "** All jobs succeeded!"
        chmod +x production/deploy.sh && production/deploy.sh
      else
        echo "** Some jobs failed"
      fi
    fi

    ;;

  after_failure)
    python travis_after_all.py
    export $(cat .to_export_back) > /dev/null 2>&1
    if [ "$BUILD_LEADER" = "YES" ]; then
      if [ "$BUILD_AGGREGATE_STATUS" = "others_failed" ]; then
        echo "** All jobs failed"
      else
        echo "** Some jobs failed"
      fi
    fi

    ;;

  *)
    echo "Usage: $0 (test|build) -- unknown command '$1'"
    exit 1
esac
