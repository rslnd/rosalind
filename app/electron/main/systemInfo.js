const { app } = require('electron')
const os = require('os')

const systemInfo = {
  client: 'electron',
  version: app.getVersion(),
  hostname: os.hostname(),
  username: os.userInfo().username,
  os: os.release()
}

module.exports = systemInfo
