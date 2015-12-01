electron = require('app')
GhReleases = require('electron-gh-releases')
githubUpdater = new GhReleases
  repo: 'albertzak/rosalind'
  currentVersion: electron.getVersion()

githubUpdater.on 'update-downloaded', (info) ->
  console.log('[Updater] Update downloaded: ', info)

module.exports =
  handleStartupEvent: ->
    return unless process.platform is 'win32'

    squirrelCommand = process.argv[1]
    console.log('[Updater] Squirrel flags:', squirrelCommand)

    switch squirrelCommand
      when '--squirrel-install', '--squirrel-updated'
        # Optionally do things such as:
        # - Install desktop and start menu shortcuts
        # - Add your .exe to the PATH
        # - Write to the registry for things like file associations and
        #   explorer context menus
        electron.quit()

      when '--squirrel-uninstall'
        # Undo anything you did in the --squirrel-install and
        # --squirrel-updated handlers
        electron.quit()

      when '--squirrel-obsolete'
        # This is called on the outgoing version of your app before
        # we update to the new version - it's the opposite of
        # --squirrel-updated
        electron.quit()

  check: ->
    githubUpdater.check (err, status) ->
      console.error('[Updater] Error while checking for updates: ', err) if (err)
      if not err and status
        console.log('[Updater] Update check finished: ', status)
        console.log('[Updater] Downloading update in background')
        githubUpdater.download()
