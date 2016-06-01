#!/bin/bash

set -e

YML="-f docker-compose.yml -f docker-compose.test.yml"

case "$1" in
  install)
    echo "Setting up CI environment"

    sudo apt-get -y install xvfb oracle-java8-installer &
    { curl -L https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-`uname -s`-`uname -m` > docker-compose; } &
    npm -g install npm@latest-2 &
    wait
    sudo rm /usr/local/bin/docker-compose
    chmod +x docker-compose && sudo mv docker-compose /usr/local/bin
    java -version
    export DISPLAY=:99.0
    /sbin/start-stop-daemon --start --quiet --pidfile /tmp/custom_xvfb_99.pid --make-pidfile --background --exec /usr/bin/Xvfb -- :99 -ac -screen 0 1280x1024x16
    curl -Lo travis_after_all.py https://raw.githubusercontent.com/dmakhno/travis_after_all/master/travis_after_all.py

    ;;

  test)
    if [ -z "$ROOT_URL" ]; then
      echo "Please set ROOT_URL for running integration tests"
      exit 1
    fi

    echo -en "travis_fold:start:pull_dependencies\r"
    { docker-compose $YML pull; docker-compose $YML run meteor meteor npm install; } &
    npm install
    cd app/meteor/tests/cucumber && npm install && cd -
    wait
    echo -en "travis_fold:end:pull_dependencies\r"

    echo -en "travis_fold:start:unit_tests\r"
    npm test
    echo -en "travis_fold:end:unit_tests\r"

    echo -en "travis_fold:start:start_meteor\r"
    npm run start:test &
    for i in {1..180}; do printf "(%03d) " $i && curl -q "$ROOT_URL" && break; sleep 1; done;
    echo -en "travis_fold:end:start_meteor\r"

    echo -en "travis_fold:start:acceptance_tests\r"
    SAUCE_NAME="Rosalind build $TRAVIS_JOB_NUMBER of commit ${TRAVIS_COMMIT:0:6}" npm run test:acceptance
    echo -en "travis_fold:end:acceptance_tests\r"

    ;;

  build)
    sudo pkill sc

    echo -en "travis_fold:start:pull\r"
    docker-compose $YML pull meteor
    echo -en "travis_fold:end:pull\r"

    echo -en "travis_fold:start:dependencies\r"
    docker-compose $YML run --no-deps meteor meteor npm install
    echo -en "travis_fold:end:dependencies\r"

    echo -en "travis_fold:start:build\r"
    cd production/
    chmod +x prepare.sh
    ./prepare.sh
    ./build.sh
    echo -en "travis_fold:end:build\r"

    echo -en "travis_fold:start:image\r"
    image.sh
    echo -en "travis_fold:end:image\r"

    echo -en "travis_fold:start:push\r"
    push.sh
    echo -en "travis_fold:end:push\r"

    echo -en "travis_fold:start:deploy\r"
    deploy.sh
    cd -
    echo -en "travis_fold:end:deploy\r"

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
