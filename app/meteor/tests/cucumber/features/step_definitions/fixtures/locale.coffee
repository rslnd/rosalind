module.exports =
  reset: ->
    browser.waitForExist('#loaded')

    browser.execute ->
      window.testing = true
      TAPi18n.setLanguage('en')
      moment.locale('en-US')

    browser.waitForExist('#locale.en')
