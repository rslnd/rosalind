#!/bin/bash

set -e

cd "$(dirname "$0")"

source prepare.sh

echo "** Pushing image $DOCKER_IMAGE_WITH_TAG"
time docker push $DOCKER_IMAGE_WITH_TAG

echo "** Pushing image $DOCKER_IMAGE:latest"
time docker push $DOCKER_IMAGE:latest

cd -
