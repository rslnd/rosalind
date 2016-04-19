#!/bin/bash

set -e

YML="-f docker-compose.yml -f docker-compose.test.yml"

case "$1" in
  test)
    docker-compose $YML pull
    docker-compose $YML run meteor meteor npm install
    npm run start:test &
    for i in {1..180}; do curl 'http://0.0.0.0:3000' && break; sleep 1; done;
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
