require('shelljs/global');

var testCommand = [
  'VELOCITY_CI=1',
  'JASMINE_CLIENT_UNIT=1',
  'JASMINE_SERVER_INTEGRATION=0',
  'JASMINE_BROWSER=Chrome',
  'SELENIUM_BROWSER=phantomjs',
  'meteor',
  '--test',
  '--settings ../environments/test/settings.json',
  '--release velocity:METEOR@1.1.0.3_1'
].join(' ');

if (process.env.CI) {
  console.warn('** Note: Do not run tests with this script on CI');
  console.warn('** Note: Shelljs always returns zero exit code even when tests fail');
  console.log('** Use instead:\n' + testCommand);
} else {
  console.log('Running:\n' + testCommand);
  cd(__dirname);
  cd('../../..');
  exec(testCommand);
}
