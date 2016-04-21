#!/bin/bash

set -e

YML="-f docker-compose.yml -f docker-compose.test.yml"

case "$1" in
  test)
    if [ -z "$ROOT_URL" ]; then
      echo "Please set ROOT_URL for running integration tests"
      exit 1
    fi

    docker-compose $YML pull
    cd app/meteor/tests/cucumber && npm install && cd -
    docker-compose $YML run meteor meteor npm install
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
