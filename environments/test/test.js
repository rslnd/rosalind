var path = require('path'),
  fs = require('fs'),
  extend = require('util')._extend,
  exec = require('child_process').exec,
  processes = [];

require('shelljs/global');

cd(__dirname);
cd('../../');

var appOptions = {
  settings: '../../environments/test/settings.json',
  env: {
    ROOT_URL: 'http://localhost:3000/'
  }
};


var chimp = [
  './node_modules/.bin/chimp',
  '--ddp=' + appOptions.env.ROOT_URL,
  '--path=app/meteor/tests/cucumber/features/',
  '--browser=chrome'
];

if (process.env.CUCUMBER_JSON_OUTPUT)
  chimp.push('--jsonOutput=' + process.env.CUCUMBER_JSON_OUTPUT);

chimp = chimp.join(' ');

var runEslint = function(callback) {
  startProcess({
    name: 'ESLint',
    command: './node_modules/eslint/bin/eslint.js .'
  }, callback);
};

var runCoffeelint = function(callback) {
  startProcess({
    name: 'CoffeeLint',
    command: './node_modules/coffeelint/bin/coffeelint --quiet .'
  }, callback);
};

var startApp = function(callback) {
  startProcess({
    name: 'Meteor',
    command: 'cd ./app/meteor/ && meteor --settings ' + appOptions.settings,
    waitForMessage: 'App running at',
    failOnMessage: 'Your application has errors',
    options: {
      env: extend(appOptions.env, process.env)
    }
  }, callback);
};

var startChimp = function() {
  startProcess({
    name: 'Chimp',
    command: chimp,
    failOnMessage: 'Not running'
  });
};

var killProcess = function(code) {
  console.log('** Exiting with code ' + code);

  if (code == 0)
    console.log('** Yay! All tests passed.');


  for (var i = 0; i < processes.length; i += 1) {
    processes[i].kill();
  }
  process.exit(code);
};

var startProcess = function(opts, callback) {
  console.log('** Running ' + opts.name);

  var proc = exec(
     opts.command,
     opts.options
  );
  if (opts.waitForMessage) {
    proc.stdout.on('data', function waitForMessage(data) {
      if (data.toString().match(opts.failOnMessage)) {
        killProcess(1);
      }

      if (data.toString().match(opts.waitForMessage)) {
        if (callback) {
          callback();
        }
      }
    });
  }

  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stderr);

  proc.on('close', function(code) {
    console.log('   ' + opts.name, 'exited with code ' + code);

    if ( ! opts.waitForMessage && callback && code === 0) {
      callback();
    } else {
      killProcess(code);
    }
  });
  processes.push(proc);
};


runEslint(function() {
  runCoffeelint(function() {
    startApp(function() {
      startChimp();
    });
  });
});
