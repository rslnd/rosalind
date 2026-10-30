// Minimal stand-in for 'meteor/meteor' in plain mocha unit tests.
// See helper.js.
module.exports = {
  Meteor: {
    isServer: true,
    isClient: false,
    isDevelopment: false,
    isProduction: false
  }
}
