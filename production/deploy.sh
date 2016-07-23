#!/bin/bash

set -e

echo "** Deploying to production"

curl -sSXPOST "$PRODUCTION_DEPLOY_HOOK" > /dev/null
