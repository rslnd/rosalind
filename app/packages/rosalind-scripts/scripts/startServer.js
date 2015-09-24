require('shelljs/global');

cd(__dirname);
cd('../../..');

require('dns').lookup(require('os').hostname(), function (err, ip, fam) {
  var rootUrl = 'http://' + ip + ':3000';
  console.log('Launching Meteor on ' + rootUrl + '\n');
  exec([
    'ROOT_URL=' + rootUrl,
    'JASMINE_CLIENT_UNIT=1',
    'JASMINE_CLIENT_INTEGRATION=0',
    'JASMINE_SERVER_UNIT=0',
    'JASMINE_SERVER_INTEGRATION=0',
    'JASMINE_BROWSER=Chrome',
    'SELENIUM_BROWSER=phantomjs',
    'meteor --settings ../environments/development/settings.json'
  ].join(' '));
})


ROOT_URL=http://localhost:3000 JASMINE_CLIENT_UNIT=1 JASMINE_CLIENT_INTEGRATION=0 JASMINE_SERVER_UNIT=0 JASMINE_SERVER_INTEGRATION=0 JASMINE_BROWSER=Chrome SELENIUM_BROWSER=phantomjs meteor --settings ../environments/development/settings.json
