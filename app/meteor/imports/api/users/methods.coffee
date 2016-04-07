{ Groups } = require '/imports/api/groups'

module.exports = (collection) ->
  findOneByIdOrUsername: (idOrUsername) ->
    if (typeof idOrUsername is 'string')
      byId = collection.findOne(idOrUsername)
      if (byId)
        return byId

      byUsername = collection.findOne(username: idOrUsername)
      if (byUsername)
        return byUsername

     else if (typeof idOrUsername is 'object')
       if (idOrUsername.collection and idOrUsername.collection())
         return idOrUsername

       byCursor = (idOrUsername and idOrUsername.fetch and idOrUsername.fetch()[0])
       if (byCursor)
         return idOrUsername.fetch()[0]


  queryExactlyOne: (query) ->
    selector = {}

    query = query.split(/\s+/).join(' ')

    selector['profile.titlePrepend'] = 'Dr.' if query.match(/Dr\./)
    query = query.replace('Dr. ', '')

    selector['$or'] = [
      { 'profile.lastName': query.split(' ')[0] }
      { 'profile.firstName': query.split(' ')[0] }
    ]

    collection.findOne(selector)


  byGroup: (selector = {}) ->
    _.map Groups.methods.all(), (g) ->
      group: g
      users: g.users(selector)
