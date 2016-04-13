#!/bin/bash

set -e

echo "** Building meteor bundle"

cd "$(dirname "$0")"

(for i in {1..20}; do sleep 30 && echo -e "\nStill working ($i)\n" && test -e ../../build/bundle/package.json && break; done;) &

docker-compose -f ../development/docker-compose.yml run meteor bash -c 'rm -rf /build/* \
  && meteor build --architecture=os.linux.x86_64 --server=http://0.0.0.0 --directory /build/ \
  && cp /app/package.json /build/bundle/'

cd -

echo "** Done building meteor bundle"
