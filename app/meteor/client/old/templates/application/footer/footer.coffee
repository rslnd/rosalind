Time = require 'util/time'

Template.footer.helpers
  printedStamp: ->
    return unless Meteor.user()
    TAPi18n.__ 'ui.printedStamp',
      name: Meteor.user().fullName()
      time: Time.time()
      date: Time.date()
