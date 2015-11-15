Meteor.publish @, ->
  Meteor.roles.find({}) if(@userId)
