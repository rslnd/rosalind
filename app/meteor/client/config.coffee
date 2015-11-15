Meteor.startup ->
  Meteor.call 'isTesting', (err, isTesting) ->
    if isTesting
      TAPi18n.setLanguage('en-US')
      moment.locale('en-us')
    else
      TAPi18n.setLanguage('de-AT')
      moment.locale('de-at')
