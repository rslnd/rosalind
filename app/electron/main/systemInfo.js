const systemInfo = {
  send: ({ ipcReceiver }) => {
    const info = {
      client: 'electron'
    }

    ipcReceiver.webContents.send('systemInfo', info)
  }
}

module.exports = systemInfo
