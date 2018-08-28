const { app } = require('electron')
const os = require('os')

const systemInfo = {
  send: ({ ipcReceiver }) => {
    const info = {
      client: 'electron',
      version: app.getVersion(),
      hostname: os.hostname(),
      username: os.userInfo().username,
      os: os.release()
    }

    ipcReceiver.webContents.send('systemInfo', info)
  }
}

module.exports = systemInfo
