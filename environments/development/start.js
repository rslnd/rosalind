require('shelljs/global');

cd(__dirname);
exec('node startServer.js', {async: true});

exec('electron ../../app/packages/rosalind-native/', {async: true});
