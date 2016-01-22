require('shelljs/global');

cd(__dirname);
cd('../../app/meteor/');
exec('chimp --ddp=http://localhost:3000 --path=./tests/cucumber/features/');
