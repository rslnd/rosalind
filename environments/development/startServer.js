require('shelljs/global');

cd(__dirname);
cd('../../app/meteor/');

require('dns').lookup(require('os').hostname(), function (err, ip) {
  var rootUrl = 'http://' + ip + ':3000';
  console.log('** Launching Meteor on ' + rootUrl + '\n');
  exec([
    'ROOT_URL=' + rootUrl,
    'JASMINE_CLIENT_UNIT=1',
    'JASMINE_CLIENT_INTEGRATION=0',
    'JASMINE_SERVER_UNIT=0',
    'JASMINE_SERVER_INTEGRATION=0',
    'JASMINE_BROWSER=chrome',
    'SELENIUM_BROWSER=chrome',
    'MONGO_URL=mongodb://docker.local:27017/rosalind',
    'ELASTICSEARCH_URL=http://docker.local:9200',
    'meteor --settings ../../environments/development/settings.json'
  ].join(' '));
});
