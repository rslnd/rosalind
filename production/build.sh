#!/bin/bash

set -e

echo "** Building app"

cd "$(dirname "$0")"

echo -en "travis_fold:start:pack\r"
chmod +x ./pack.sh
echo -en "travis_fold:end:pack\r"

chmod +x ./x86/build.sh
chmod +x ./arm/build.sh

./pack.sh
./x86/build.sh
# ./arm/build.sh

cd -

echo "** Done"
