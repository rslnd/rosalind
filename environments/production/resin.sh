#!/bin/bash

set -e

cd "$(dirname "$0")"

if [ ! -e ../../build/bundle/package.json ]; then
  echo "** Skipping push to resin.io"
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
    sudo chown -R $USER:$USER ../../build
  fi

  cp ../../app/meteor/.dockerignore ../../build/bundle/

  cd ../../build/bundle/
  mkdir ../image/

  tar -zcf ../image/package.tar.gz .

  cd ../image/
  cp ../../environments/production/Dockerfile Dockerfile

  git init
  git add -A .
  git commit -m "🐝 Commit ${TRAVIS_COMMIT:0:12} built by worker $TRAVIS_JOB_NUMBER"

  git remote add resin $RESIN_REMOTE
  git push --force resin master
fi

cd -
