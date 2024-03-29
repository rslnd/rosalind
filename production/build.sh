#!/bin/bash

set -e

cd "$(dirname "$0")"

echo "** Pulling base image in background"
docker pull node:14.20.1 &

echo "** Building meteor bundle"

rm -rf ../build/
mkdir -p ../build/
cd ../app/meteor/

echo "** Building"
time meteor build --architecture=os.linux.x86_64 --server=http://0.0.0.0 --directory ../../build
cd -

mkdir -p ../build/bundle/node_modules/
cp -r ../app/meteor/node_modules/. ../build/bundle/node_modules/
cp ../app/meteor/package.json ../build/bundle/
cp ../app/meteor/env.js ../build/bundle/

cd ../build/bundle/
echo "** Pruning"
npm prune --omit=dev --legacy-peer-deps
cd -

if [ ! -z "$CI" ]; then
  echo "** Fixing permissions"
  chown -R $USER:$USER ../build/ || true
fi
