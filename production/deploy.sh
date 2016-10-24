#!/bin/bash

set -e

echo "** Branch is $BRANCH"

if [[ $BRANCH =~ (^master$|^hotfix) ]]; then
  echo "** Deploying to production"
  curl -sSXPOST "$PRODUCTION_DEPLOY_HOOK" > /dev/null
else
  echo "** Skipping production deploy"
fi
