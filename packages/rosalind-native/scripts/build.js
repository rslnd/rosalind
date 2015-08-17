var electronPackager = require('electron-packager');

var meteorDir = __dirname + '/../../../';

var options = {
  dir: __dirname + '/..',
  out: meteorDir + 'public/builds/',
  name: 'Rosalind',
  icon: undefined,
  platform: 'win32',
  arch: 'all',
  version: '0.30.1',
  versionString: {
    CompanyName: '',
    LegalCopyright: '',
    FileDescription: '',
    OriginalFilename: '',
    FileVersion: '',
    ProductVersion: '',
    ProductName: '',
    InternalName: ''
  },
  overwrite: true,
  asar: false,
  ignore: [
    'node_modules/electron-prebuilt',
    'node_modules/electron-packager',
    '.git',
    'build/',
    'scripts/',
  ].join('|')
};

electronPackager(options, function(err, appPath) {
  if (err)
    console.error(err);
  else
    console.log('Built', appPath);
});
