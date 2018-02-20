module.exports = (collection) ->
  findOneByIdOrUsername: (idOrUsername) ->
    if (typeof idOrUsername is 'string')
      byId = collection.findOne(idOrUsername)
      return byId if byId

      byUsername = collection.findOne(username: idOrUsername)
      return byUsername if byUsername

    else if (typeof idOrUsername is 'object')
      if (idOrUsername?.collection and idOrUsername.collection())
        return idOrUsername

      byCursor = (idOrUsername and idOrUsername.fetch and idOrUsername.fetch()[0])
      return idOrUsername.fetch()[0] if byCursor


  queryExactlyOne: (query) ->
    selector = {}

    query = query.split(/\s+/).join(' ')

    selector['titlePrepend'] = 'Dr.' if query.match(/Dr\./)
    query = query.replace('Dr. ', '')

    selector['$or'] = [
      { 'lastName': query.split(' ')[0] }
      { 'firstName': query.split(' ')[0] }
    ]

    collection.findOne(selector)
