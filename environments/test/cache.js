var spawn = require('child_process').spawn;
var path = require('path');
var env = process.env;

env.CACHE_PACKAGES = 1;
env.VELOCITY = 0;

var meteorProcess = spawn(
  'bash', ['test.sh'], {
    cwd: __dirname,
    stdio: 'pipe',
    env: env
  }
);

meteorProcess.stderr.pipe(process.stderr);
meteorProcess.stdout.on('data', function (data) {

  var line = data.toString();
  process.stdout.write(data);

  // watch for Meteor startup message
  if (line.indexOf('App running at') !== -1) {
    console.log('\n** Done caching Meteor packages. Exiting.\n');
    meteorProcess.kill('SIGINT');
    process.exit(0);
  }

  // watch for Meteor error messages
  if (line.indexOf('Your application is crashing') !== -1) {
    meteorProcess.kill('SIGINT');
    process.exit(1);
  }

});

meteorProcess.on('exit', function(code) {
  process.exit(code);
});
