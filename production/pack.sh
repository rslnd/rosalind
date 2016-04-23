#!/bin/bash

set -e

echo "** Packaging meteor bundle"

cd "$(dirname "$0")"

docker-compose -f '../docker-compose.yml' -f '../docker-compose.test.yml' run meteor bash -c 'rm -rf /build/* \
  && meteor build --architecture=os.linux.x86_64 --server=http://0.0.0.0 --directory /build/ \
  && cp /app/package.json /build/bundle/'

if [ ! -z "$CI" ]; then
  echo "** Fixing permissions"
  sudo chown -R $USER:$USER ../build
fi

cp ../.dockerignore ../build/bundle/
cp ../.dockerignore ../build/bundle/.gitignore

cd -
