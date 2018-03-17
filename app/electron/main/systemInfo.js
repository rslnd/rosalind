const systemInfo = {
  send: ({ ipcReceiver }) => {
    const info = {
      k: 'v'
    }

    ipcReceiver.webContents.send('systemInfo', info)
  }
}

module.exports = systemInfo
