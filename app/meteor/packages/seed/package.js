/* global Package, Npm */
Package.describe({
  name: 'seed',
  version: '0.0.1',
  debugOnly: true
})

Npm.depends({
  faker: '3.1.0',
  moment: '2.14.1'
})

Package.onUse(function (api) {
  api.versionsFrom('1.4.2-rc.1')
  api.use('ecmascript')
  api.mainModule('seed.js')
})
