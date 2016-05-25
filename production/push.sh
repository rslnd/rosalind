#!/bin/bash

set -e

echo "** Pushing image to registry"

docker push $DOCKER_IMAGE_WITH_TAG
