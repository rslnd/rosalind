require('shelljs/global');

cd(__dirname);
cd('../server/');
exec('meteor --settings settings.json');
