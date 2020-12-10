#!/bin/bash
#
# Set the following env vars:
#   DOCKER_SERVER (quay.io)
#   DOCKER_IMAGE (quay.io/rosalind/rosalind)
#   DOCKER_USERNAME
#   DOCKER_PASSWORD
#   DOCKER_EMAIL

set -e

DOCKER_TAG="$(git rev-parse --verify HEAD)"
DOCKER_TAG="${DOCKER_TAG:0:7}"

export DOCKER_IMAGE_WITH_TAG="$DOCKER_IMAGE:$DOCKER_TAG"

chmod +x build.sh
chmod +x image.sh
chmod +x push.sh
chmod +x deploy.sh
