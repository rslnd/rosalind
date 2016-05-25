#!/bin/bash

set -e

echo "** Building app"

cd "$(dirname "$0")"

chmod +x ./pack.sh
./pack.sh

chmod +x ./push.sh
./push.sh

cd -

echo "** Done"
