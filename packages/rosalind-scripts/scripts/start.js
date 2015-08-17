require('shelljs/global');

cd(__dirname);
exec('node startServer.js', {async: true});

cd('../../..');
exec('electron packages/rosalind-native/', {async: true});
