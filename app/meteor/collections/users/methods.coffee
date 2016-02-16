Meteor.users.findOneByIdOrUsername = (idOrUsername) ->
  if (typeof idOrUsername is 'string')
    byId = Meteor.users.findOne(idOrUsername)
    if (byId)
      return byId

    byUsername = Meteor.users.findOne(username: idOrUsername)
    if (byUsername)
      return byUsername

   else if (typeof idOrUsername is 'object')
     if (idOrUsername.collection and idOrUsername.collection())
       return idOrUsername

     byCursor = (idOrUsername and idOrUsername.fetch and idOrUsername.fetch()[0])
     if (byCursor)
       return idOrUsername.fetch()[0]


Meteor.users.queryExactlyOne = (query) ->
  selector = {}

  selector['profile.titlePrepend'] = 'Dr.' if query.match(/Dr\./)
  query = query.replace('Dr. ', '')

  selector['$or'] = [
    { 'profile.lastName': query.split(' ')[0] }
    { 'profile.firstName': query.split(' ')[0] }
  ]

  Meteor.users.findOne(selector)


Meteor.users.byGroup = (selector = {}) ->
  _.map(Groups.all(selector), (g) -> { group: g, users: g.users() })
