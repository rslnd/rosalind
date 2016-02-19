Meteor.startup ->
  Tags.findOneOrInsert = (selector) ->
    tag = Tags.findOne(tag: selector.tag)
    if tag
      return tag
    else
      return Tags.insert(selector)
