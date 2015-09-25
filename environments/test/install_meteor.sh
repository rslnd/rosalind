#!/bin/sh

# Exit on first command that fails
set -e

if [ -e "$HOME/.meteor/" ]; then
  echo "Removing old meteor installation"
  rm -rf "$HOME/.meteor/"
fi

if [ ! -e "$HOME/cache/meteor" ]; then
  curl -o meteor_install_script.sh https://install.meteor.com/
  chmod +x meteor_install_script.sh
  sed -i "s/type sudo >\/dev\/null 2>&1/\ false /g" meteor_install_script.sh

  ./meteor_install_script.sh

  mv ~/.meteor/ ~/cache/meteor/
fi

export PATH=~/cache/meteor/:$PATH
export METEOR=$(which meteor)
export METEOR_VERSION=$(meteor --version)

echo "** $METEOR_VERSION is installed at $METEOR"
echo "** Clear CI cache to update to latest version"

npm install -g eslint
