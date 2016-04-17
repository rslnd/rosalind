#!/bin/bash

set -e

cd "$(dirname "$0")"

if [ ! -e ../../../build/bundle/package.json ]; then
  echo "** Skipping push to resin.io"
  echo "     Please make sure you run ./pack.sh"
  echo "     and build/bundle/package.json exists."
else
  echo "** Pushing bundle to resin.io"

  if [ ! -z "$CI" ]; then
    echo "** Adding resin.io deploy key"
    eval "$(ssh-agent -s)"
    echo -e $RESIN_DEPLOY_KEY > id_rsa
    chmod 0600 id_rsa
    ssh-add ./id_rsa
    cat resin.id >> ~/.ssh/known_hosts

    echo "** Fixing permissions"
    sudo chown -R $USER:$USER ../../../build
  fi

  cd ../../../build/bundle/
  rm -rf .git/
  cp ../../environments/production/arm/Dockerfile Dockerfile

  git init
  git add -A . >/dev/null
  git commit -m "🐝 Commit ${TRAVIS_COMMIT:0:12} built by worker $TRAVIS_JOB_NUMBER" >/dev/null

  git remote add resin $RESIN_REMOTE
  git push --force resin master
fi

cd -
