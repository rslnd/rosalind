Package.describe({
  name: 'fixtures',
  version: '0.0.1',
  debugOnly: true
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.addFiles('cleaner.js');
  api.addFiles('factory.js');
  api.addFiles('testUtil.js');
  api.addFiles('users.js');
});
