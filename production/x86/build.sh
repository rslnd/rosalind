#!/bin/bash
#
# Set the following env vars:
#   DOCKER_SERVER
#   DOCKER_IMAGE
#   DOCKER_USERNAME
#   DOCKER_PASSWORD
#   DOCKER_EMAIL

set -e

DOCKER_TAG="$(git rev-parse --verify HEAD)"
DOCKER_TAG="${DOCKER_TAG:0:12}"

DOCKER_IMAGE="$DOCKER_IMAGE:$DOCKER_TAG"

cd "$(dirname "$0")"

if [ ! -e ../../build/bundle/package.json ]; then
  echo "** Skipping x86 build"
  echo "     Please make sure you run ./pack.sh"
  echo "     and build/bundle/package.json exists."
else

  if [ ! -z $CI ]; then
    docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD -e $DOCKER_EMAIL $DOCKER_SERVER
  fi

  echo "** Building x86 image: $DOCKER_IMAGE"

  cp Dockerfile ../../build/bundle/Dockerfile

  cd ../../build/bundle/

  docker build -t $DOCKER_IMAGE .

  rm Dockerfile

  cd -

  echo "** Pushing x86 image"

docker push $DOCKER_IMAGE
fi
