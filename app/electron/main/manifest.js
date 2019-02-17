const { app } = require('electron')

module.exports = {
  appId: 'com.rslnd.rosalind',
  name: 'Rosalind',
  productName: 'Rosalind',
  version: app.getVersion()
}
