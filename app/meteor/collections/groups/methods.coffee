Meteor.startup ->
  Groups.all = ->
    Groups.find({}, sort: { order: 1 }).fetch()
