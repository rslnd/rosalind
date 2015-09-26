#!/bin/bash

# Exit on first command that fails
set -e

DIR=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
cd $DIR

REQUIRED_METEOR_VERSION=$(cat ../../app/meteor/.meteor/release)
REQUIRED_METEOR_VERSION=${REQUIRED_METEOR_VERSION:7}
echo "** Project requires Meteor $REQUIRED_METEOR_VERSION"

cd $DIR

export PATH=~/.meteor/:$PATH

install_meteor () {
  echo "** Installing latest Meteor"

  curl -o meteor_install_script.sh https://install.meteor.com/
  chmod +x meteor_install_script.sh
  sed -i "s/type sudo >\/dev\/null 2>&1/\ false /g" meteor_install_script.sh

  ./meteor_install_script.sh

  mkdir -p ~/cache/
  mv ~/.meteor/ ~/cache/
  mv ~/cache/.meteor/ ~/cache/meteor_temp
  mv ~/cache/meteor_temp ~/cache/meteor
}

clear_cache () {
  echo "** Clearing cache"
  rm -rf ~/.meteor
  rm -rf ~/cache
}

symlink () {
  echo "** Creating symlink"
  ln -s ~/cache/meteor/ ~/.meteor
  export PATH=~/.meteor/:$PATH
}

if [ -x "$(command -v meteor)" ]; then
  INSTALLED_METEOR_VERSION=$(meteor --version)
  INSTALLED_METEOR_VERSION=${INSTALLED_METEOR_VERSION:7}
  echo "** Cache contains Meteor $INSTALLED_METEOR_VERSION"

  if [ "$INSTALLED_METEOR_VERSION" == "$REQUIRED_METEOR_VERSION" ]; then
    echo "** Okay, installed and required Meteor versions match"
  else
    clear_cache
    install_meteor
  fi
else
  echo "** Meteor not installed"
  install_meteor
fi

symlink
METEOR_VERSION=$(~/.meteor/meteor --version)
echo "** Using $METEOR_VERSION"
echo -e "** Clear CI cache to update to latest version\n"

echo "** Installing ESLint"
npm install -g eslint
