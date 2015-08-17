require('shelljs/global');

cd(__dirname);
cd('../../..');

require('dns').lookup(require('os').hostname(), function (err, ip, fam) {
  var rootUrl = 'http://' + ip + ':3000';
  console.log('Listening on ' + rootUrl);
  exec('ROOT_URL=' + rootUrl + ' meteor --settings settings.json');
})
