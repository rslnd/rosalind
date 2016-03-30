module.exports = (collection) ->
  findOneOrInsert: (selector) ->
    tag = collection.findOne(tag: selector.tag)
    if tag
      return tag
    else
      return collection.insert(selector)
