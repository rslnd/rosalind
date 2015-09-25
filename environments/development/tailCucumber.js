require('shelljs/global');

cd(__dirname);
cd('../../app/');
exec('tail -f .meteor/local/log/cucumber.log');
