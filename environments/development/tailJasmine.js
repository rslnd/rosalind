require('shelljs/global');

cd(__dirname);
cd('../../app/');
exec('tail -f .meteor/local/log/jasmine-server-integration.log');
