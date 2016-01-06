return unless window?.electron?

window.NativeSettings = null

ipc.on 'settings', (e, settings) ->
  console.log('[Meteor Native] Settings: received settings via ipc', settings)
  window.NativeSettings = settings

ipc.send('settings')
