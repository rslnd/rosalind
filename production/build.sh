#!/bin/bash

set -e

cd "$(dirname "$0")"

echo "** Pulling base image in background"
docker pull node:8.1.4 &

echo "** Building meteor bundle"

rm -rf ../build/
mkdir -p ../build/
cd ../app/meteor/

echo "** Removing debug packages"
time meteor remove xolvio:backdoor xolvio:cleaner || true

echo "** Building"
time meteor build --architecture=os.linux.x86_64 --server=http://0.0.0.0 --directory ../../build
cd -

mkdir -p ../build/bundle/node_modules/
cp -r ../app/meteor/node_modules/. ../build/bundle/node_modules/
cp ../app/meteor/package.json ../build/bundle/

cd ../build/bundle/
npm prune --production
cd -

if [ ! -z "$CI" ]; then
  echo "** Fixing permissions"
  sudo chown -R $USER:$USER ../build/
fi
