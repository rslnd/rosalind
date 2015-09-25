#/bin/sh

# Exit on first command that fails
set -e

echo "** Installing mupx"
npm -g install mupx

echo "** Downloading encrypted SSL keys"
curl -o bundle.crt.enc https://carbonative.s3-eu-central-1.amazonaws.com/ssl/bundle.crt.enc
curl -o key.key.enc https://carbonative.s3-eu-central-1.amazonaws.com/ssl/key.key.enc

echo "** Decrypting SSL keys"
openssl aes-256-cbc -k "$PRODUCTION_SSL_ENCRYPTION_KEY" -in bundle.crt.enc -out bundle.crt -d
openssl aes-256-cbc -k "$PRODUCTION_SSL_ENCRYPTION_KEY" -in key.key.enc -out key.key -d

echo "** Moving SSL keys"
mkdir -p ~/cache/ssl/
mv bundle.crt ~/cache/ssl/
mv key.key ~/cache/ssl/

echo "** Setting environment variables in mup.json"
sed 's^$PRODUCTION_MUP_HOST^'"$PRODUCTION_MUP_HOST"'^' -i mup.json
sed 's^$PRODUCTION_MUP_USERNAME^'"$PRODUCTION_MUP_USERNAME"'^' -i mup.json
sed 's^$PRODUCTION_MUP_PUBLIC_KEY_PATH^'"$PRODUCTION_MUP_PUBLIC_KEY_PATH"'^' -i mup.json
sed 's^$PRODUCTION_MUP_APP_PATH^'"$PRODUCTION_MUP_APP_PATH"'^' -i mup.json
sed 's^$PRODUCTION_MUP_ROOT_URL^'"$PRODUCTION_MUP_ROOT_URL"'^' -i mup.json
sed 's^$PRODUCTION_MUP_KADIRA_APP_ID^'"$PRODUCTION_MUP_KADIRA_APP_ID"'^' -i mup.json
sed 's^$PRODUCTION_MUP_KADIRA_APP_SECRET^'"$PRODUCTION_MUP_KADIRA_APP_SECRET"'^' -i mup.json
sed 's^$PRODUCTION_MUP_SSL_CERTIFICATE_PATH^'"$PRODUCTION_MUP_SSL_CERTIFICATE_PATH"'^' -i mup.json
sed 's^$PRODUCTION_MUP_SSL_KEY_PATH^'"$PRODUCTION_MUP_SSL_KEY_PATH"'^' -i mup.json

echo "** Setting environment variables in settings.json"
sed 's^$PRODUCTION_SETTINGS_PUBLIC_CUSTOMER_NAME^'"$PRODUCTION_SETTINGS_PUBLIC_CUSTOMER_NAME"'^' -i settings.json
sed 's^$PRODUCTION_SETTINGS_PRIVATE_ADMIN_DEFAULTACCOUNT_USERNAME^'"$PRODUCTION_SETTINGS_PRIVATE_ADMIN_DEFAULTACCOUNT_USERNAME"'^' -i settings.json
sed 's^$PRODUCTION_SETTINGS_PRIVATE_ADMIN_DEFAULTACCOUNT_PASSWORD^'"$PRODUCTION_SETTINGS_PRIVATE_ADMIN_DEFAULTACCOUNT_PASSWORD"'^' -i settings.json
sed 's^$PRODUCTION_SETTINGS_PRIVATE_ADMIN_DEFAULTACCOUNT_EMAIL^'"$PRODUCTION_SETTINGS_PRIVATE_ADMIN_DEFAULTACCOUNT_EMAIL"'^' -i settings.json
sed 's^$PRODUCTION_SETTINGS_PRIVATE_ADMIN_DEFAULTACCOUNT_PROFILE_FIRSTNAME^'"$PRODUCTION_SETTINGS_PRIVATE_ADMIN_DEFAULTACCOUNT_PROFILE_FIRSTNAME"'^' -i settings.json
sed 's^$PRODUCTION_SETTINGS_PRIVATE_ADMIN_DEFAULTACCOUNT_PROFILE_LASTNAME^'"$PRODUCTION_SETTINGS_PRIVATE_ADMIN_DEFAULTACCOUNT_PROFILE_LASTNAME"'^' -i settings.json

echo "** Deploying"
mupx deploy
