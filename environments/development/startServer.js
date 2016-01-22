require('shelljs/global');

cd(__dirname);
cd('../../app/meteor/');

require('dns').lookup(require('os').hostname(), function (err, ip) {
  var rootUrl = 'http://' + ip + ':3000';
  console.log('** Launching Meteor on ' + rootUrl + '\n');
  exec([
    'ROOT_URL=' + rootUrl,
    'MONGO_URL=mongodb://docker.local:27017/rosalind',
    'ELASTICSEARCH_URL=http://docker.local:9200',
    'meteor --settings ../../environments/development/settings.json'
  ].join(' '));
});
