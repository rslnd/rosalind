require('shelljs/global');

cd(__dirname);
cd('../../app/meteor/');
exec('tail -f .meteor/local/log/jasmine-server-integration.log');
