require('shelljs/global');

cd(__dirname);
cd('../server/');
exec('tail -f .meteor/local/log/cucumber.log');
