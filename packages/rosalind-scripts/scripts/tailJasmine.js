require('shelljs/global');

cd(__dirname);
cd('../../..');
exec('tail -f .meteor/local/log/jasmine-client-integration.log');
