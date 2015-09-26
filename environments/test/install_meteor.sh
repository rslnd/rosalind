#!/bin/bash

# Exit on first command that fails
set -e

DIR=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
cd $DIR

  REQUIRED_METEOR_VERSION=$(cat ../../app/meteor/.meteor/release)
REQUIRED_METEOR_VERSION=${REQUIRED_METEOR_VERSION:7}
echo "** Project requires Meteor $REQUIRED_METEOR_VERSION"

cd $DIR

if [ -x "$HOME/cache/meteor/meteor" ]; then
  echo "** Cache contains Meteor"
  ~/cache/meteor/meteor --version
else
  echo "** No cached Meteor installation found"
  echo "** Installing latest Meteor"

  curl -o meteor_install_script.sh https://install.meteor.com/
  chmod +x meteor_install_script.sh
  sed -i "s/type sudo >\/dev\/null 2>&1/\ false /g" meteor_install_script.sh

  ./meteor_install_script.sh

  mv ~/.meteor/ ~/cache/meteor/
  ln -s ~/cache/meteor/ ~/.meteor/
fi

export PATH=~/.meteor/:$PATH
export METEOR_WAREHOUSE_DIR ~/cache/meteor/

METEOR_VERSION=$(~/.meteor/meteor --version)
echo "** Using $METEOR_VERSION"
echo "** Clear CI cache to update to latest version"

npm install -g eslint
