module.exports =
  reset: ->
    browser.execute ->
      Session.set('test', true)

    browser.waitForExist('#locale.en')
