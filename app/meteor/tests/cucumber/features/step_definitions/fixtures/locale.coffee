module.exports =
  reset: ->
    browser.execute ->
      window.testing = true
      Meteor.startup ->
        TAPi18n.setLanguage('en')
        moment.locale('en-US')
    browser.waitForExist('#locale.en')
