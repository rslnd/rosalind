Package.describe({
  name: 'fixtures',
  version: '0.0.1',
  debugOnly: true
})

Package.onUse(function(api) {
  api.versionsFrom('1.2.1')
  api.use('coffeescript')
  api.addFiles('cleaner.coffee')
  api.addFiles('eval.coffee')
  api.addFiles('factory.coffee')
  api.addFiles('testUtil.coffee')
  api.addFiles('users.coffee')
})
