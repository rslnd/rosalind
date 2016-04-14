#!/bin/bash

set -e

echo "** Building app"

./pack.sh
./resin.sh

echo "** Done"
