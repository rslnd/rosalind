#!/bin/bash

set -e

YML="-f docker-compose.yml -f docker-compose.test.yml"

case "$1" in
  install)
    echo "Setting up CI environment"

    sudo apt-get -y install xvfb &
    ( npm install n && sudo ./node_modules/.bin/n ${NODE_VERSION} && rm -rf ~/.nvm ) &
    ( curl -L https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-`uname -s`-`uname -m` > docker-compose ) &
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

    ( docker-compose $YML pull && docker-compose $YML run meteor meteor npm install ) &
    npm install &
    ( cd app/meteor/tests/cucumber && npm install && cd - ) &
    wait
    npm run start:test &
    for i in {1..180}; do curl "$ROOT_URL" && break; sleep 1; done;
    npm test

    ;;

  build)
    docker-compose $YML pull meteor
    chmod +x production/build.sh && ./production/build.sh

    ;;

  *)
    echo "Usage: $0 (test|build) -- unknown command '$1'"
    exit 1
esac
