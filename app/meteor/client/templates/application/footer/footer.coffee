Template.footer.helpers
  printedStamp: ->
    TAPi18n.__ 'ui.printedStamp',
      name: Meteor.user().fullName()
      time: Time.time()
      date: Time.date()
