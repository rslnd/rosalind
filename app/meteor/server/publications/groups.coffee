Meteor.publish 'groups', ->
  Groups.find({}) if @userId
