require('shelljs/global');

cd(__dirname);
cd('..');
exec('meteor --settings settings.json');
