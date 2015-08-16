require('shelljs/global');

cd(__dirname);
cd('..');
exec('npm run server:start', { async:true });
exec('npm run client:start', { async:true });
