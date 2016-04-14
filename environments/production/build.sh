#!/bin/bash

set -e

echo "** Building app"

cd "$(dirname "$0")"

./pack.sh
./resin.sh

cd -

echo "** Done"
