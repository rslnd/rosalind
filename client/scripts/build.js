var electronPackager = require('electron-packager');

var options = {
  dir: __dirname + '/../',
  out: __dirname + '/../build/',
  name: 'Rosalind',
  icon: undefined,
  platform: 'win32',
  arch: 'all',
  version: '0.29.2',
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
  asar: true,
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
