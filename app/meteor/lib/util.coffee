@Util = {}

Util.autoCreatedAt = ->
  return new Date() if @isInsert
  return { $setOnInsert: new Date() } if @isUpsert
  @unset()

Util.autoCreatedBy = ->
  try
    return Meteor.userId() if @isInsert
    return { $setOnInsert: Meteor.userId() } if @isUpsert
    @unset()
  catch
    @unset()
