#!/bin/bash

set -e

cd "$(dirname "$0")"

echo -en "travis_fold:start:meteor_pack\r"

echo "** Packaging meteor bundle"

docker-compose -f '../docker-compose.yml' -f '../docker-compose.test.yml' run meteor bash -c 'rm -rf /build/* \
  && meteor build --architecture=os.linux.x86_64 --server=http://0.0.0.0 --directory /build/ \
  && cp /app/package.json /build/bundle/'

if [ ! -z "$CI" ]; then
  echo "** Fixing permissions"
  sudo chown -R $USER:$USER ../build
fi

echo -en "travis_fold:end:meteor_pack\r"


cd -
