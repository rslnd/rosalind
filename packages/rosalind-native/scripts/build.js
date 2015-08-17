var path = require('path');
var grunt = require('grunt');
var temp = require('temp').track();
var electronPackager = require('electron-packager');
var meteorDir = path.resolve(__dirname + '/../../../');

var packagerOptions = {
  dir: path.resolve(__dirname + '/..'),
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
    'node_modules/grunt',
    'node_modules/grunt-electron-installer',
    '.git',
    'build/',
    'scripts/'
  ].join('|')
};

var installerOptions = {
  outputDirectory: meteorDir + 'public/builds/<ARCH>/',
  authors: 'My App Inc.',
  exe: 'r.exe'
};


var buildInstaller = function(intermediateDirectories) {
  var options = {ia32: {}, x64: {}};

  var outputDirectory32 = installerOptions.outputDirectory;
  options.ia32 = installerOptions;
  options.ia32.appDirectory = intermediateDirectories[0];
  options.ia32.outputDirectory = installerOptions.outputDirectory.split('<ARCH>').join('32bit');

  var outputDirectory64 = installerOptions.outputDirectory;
  options.x64 = installerOptions;
  options.x64.appDirectory = intermediateDirectories[1];
  options.x64.outputDirectory = outputDirectory64.split('<ARCH>').join('64bit');

  grunt.task.init = function() {};
  grunt.initConfig({'create-windows-installer': options});
  grunt.loadNpmTasks('grunt-electron-installer');
  grunt.tasks(['create-windows-installer'], {}, function() {
    temp.cleanupSync();
    grunt.log.ok('Built installers: ' + installerOptions.outputDirectory);
  });
};

temp.mkdir('rosalind-intermediate', function(err, dirPath) {
  packagerOptions.out = dirPath;
  electronPackager(packagerOptions, function(err, appPath) {
    if (err) {
      console.error(err);
    } else {
      console.log('Built', appPath);
      buildInstaller(appPath);
    }
  });
});
