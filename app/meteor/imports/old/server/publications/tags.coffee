Meteor.publish 'tags', ->
  Tags.find({}) if @userId
