#!/bin/bash

set -e

if [ $BRANCH == "master" ]; then
  echo "** Deploying to production"
  curl -sSXPOST "$PRODUCTION_DEPLOY_HOOK" > /dev/null
else
  echo "** Skipping production deploy"
fi
