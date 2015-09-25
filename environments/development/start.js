require('shelljs/global');

cd(__dirname);
exec('node startServer.js', {async: true});

cd('../../app/electron/');
exec('electron .', {async: true});
