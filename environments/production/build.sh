#!/bin/bash

set -e

echo "** Building app"

cd "$(dirname "$0")"

chmod +x ./pack.sh
chmod +x ./x86/build.sh
chmod +x ./arm/build.sh

./pack.sh
./x86/build.sh
# ./arm/build.sh

cd -

echo "** Done"
