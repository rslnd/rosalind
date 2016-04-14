#!/bin/bash

set -e

echo "** Packaging meteor bundle"

cd "$(dirname "$0")"

docker-compose -f ../development/docker-compose.yml run meteor bash -c 'rm -rf /build/* \
  && meteor build --architecture=os.linux.x86_64 --server=http://0.0.0.0 --directory /build/ \
  && cp /app/package.json /build/bundle/'

cd -
