require('shelljs/global');

cd(__dirname);
cd('../../..');

require('dns').lookup(require('os').hostname(), function (err, ip, fam) {
  var rootUrl = 'http://' + ip + ':3000';
  console.log('Listening on ' + rootUrl + '\n');
  exec([
    'ROOT_URL=' + rootUrl,
    'PHANTOM_PATH=`which phantomjs`',
    'JASMINE_BROWSER=PhantomJS',
    'SELENIUM_BROWSER=phantomjs',
    'meteor --settings settings.json'
  ].join(' '));
})
