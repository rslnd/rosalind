require('shelljs/global');

var testCommand = [
  'VELOCITY_CI=1',
  'JASMINE_CLIENT_UNIT=1',
  'JASMINE_SERVER_INTEGRATION=1',
  'JASMINE_BROWSER=chrome',
  'SELENIUM_BROWSER=chrome',
  'meteor',
  '--test',
  '--settings ../environments/test/settings.json',
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
