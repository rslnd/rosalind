// Babel's preset-env transpiles async functions to generators backed by
// regeneratorRuntime, which plain mocha (outside Meteor) does not provide.
require('regenerator-runtime/runtime')

// Shared modules branch on Meteor.isServer since the Meteor 3 migration.
// Outside Meteor there is no 'meteor/meteor' package, so resolve it to a
// minimal server-side stub.
var Module = require('module')
var path = require('path')
var originalResolveFilename = Module._resolveFilename
Module._resolveFilename = function (request, ...rest) {
  if (request === 'meteor/meteor') {
    return path.join(__dirname, 'meteorStub.js')
  }
  return originalResolveFilename.call(this, request, ...rest)
}

var IntlPolyfill = require('intl')
Intl.NumberFormat = IntlPolyfill.NumberFormat
Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat

var chai = require('chai')

chai.use(require('chai-datetime'))

global.expect = chai.expect
