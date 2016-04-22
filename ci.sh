#!/bin/bash

set -e

YML="-f docker-compose.yml -f docker-compose.test.yml"

case "$1" in
  install)
    echo "Setting up CI environment"

    sudo apt-get -y install xvfb &
    { curl -L https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-`uname -s`-`uname -m` > docker-compose; } &
    npm -g install npm@latest-2 &
    wait
    sudo rm /usr/local/bin/docker-compose
    chmod +x docker-compose && sudo mv docker-compose /usr/local/bin

    export DISPLAY=:99.0
    /sbin/start-stop-daemon --start --quiet --pidfile /tmp/custom_xvfb_99.pid --make-pidfile --background --exec /usr/bin/Xvfb -- :99 -ac -screen 0 1280x1024x16

    ;;

  test)
    if [ -z "$ROOT_URL" ]; then
      echo "Please set ROOT_URL for running integration tests"
      exit 1
    fi

    echo -en "travis_fold:start:Pulling image and installing dependencies\r"
    { docker-compose $YML pull; docker-compose $YML run meteor meteor npm install; } &
    npm install
    cd app/meteor/tests/cucumber && npm install && cd -
    wait
    echo -en "travis_fold:end:Pulling image and installing dependencies\r"

    echo -en "travis_fold:start:Installing meteor packages and starting server\r"
    npm run start:test &
    for i in {1..180}; do printf "(%03d) " $i && curl -q "$ROOT_URL" && break; sleep 1; done;
    echo -en "travis_fold:end:Installing meteor packages and starting server\r"

    echo -en "travis_fold:start:Running integration test suite\r"
    SAUCE_NAME="Rosalind ${TRAVIS_COMMIT:0:12} ($TRAVIS_JOB_NUMBER)" npm test
    echo -en "travis_fold:end:Running integration test suite\r"

    ;;

  build)
    echo -en "travis_fold:start:Pulling meteor image\r"
    docker-compose $YML pull meteor
    echo -en "travis_fold:end:Pulling meteor image\r"

    echo -en "travis_fold:start:Installing meteor packages\r"
    docker-compose $YML run meteor meteor npm install
    echo -en "travis_fold:end:Installing meteor packages\r"

    echo -en "travis_fold:start:Building production bundle\r"
    chmod +x production/build.sh && ./production/build.sh
    echo -en "travis_fold:end:Building production bundle\r"

    ;;

  *)
    echo "Usage: $0 (test|build) -- unknown command '$1'"
    exit 1
esac
