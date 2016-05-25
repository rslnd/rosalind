#!/bin/bash
#
# Set the following env vars:
#   DOCKER_SERVER
#   DOCKER_IMAGE
#   DOCKER_USERNAME
#   DOCKER_PASSWORD
#   DOCKER_EMAIL

set -e

cd "$(dirname "$0")"

echo "** "

DOCKER_TAG="$(git rev-parse --verify HEAD)"
DOCKER_TAG="${DOCKER_TAG:0:12}"

export DOCKER_IMAGE_WITH_TAG="$DOCKER_IMAGE:$DOCKER_TAG"

chmod +x build.sh
chmod +x image.sh
chmod +x push.sh
chmod +x deploy.sh

cd -
