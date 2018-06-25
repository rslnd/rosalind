const { app } = require('electron')

module.exports = {
  appId: 'com.squirrel.rslnd.rosalind',
  name: 'Rosalind',
  productName: 'Rosalind',
  version: app.getVersion()
}
