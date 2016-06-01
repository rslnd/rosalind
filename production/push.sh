#!/bin/bash

set -e

echo "** Pushing image to registry"

cd "$(dirname "$0")"

source prepare.sh

docker push $DOCKER_IMAGE_WITH_TAG
docker push $DOCKER_IMAGE:latest

cd -
