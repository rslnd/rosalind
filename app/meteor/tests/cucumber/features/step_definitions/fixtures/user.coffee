module.exports =
  logout: ->
    browser.execute ->
      Meteor.call 'users/logout', ->
        Meteor.logout()
        window.location.href = '/'
