temp = Meteor.npmRequire('temp').track()

parseUploadedFile = (path, options) ->
  switch options.importer
    when 'terminiko'
      Importers.Terminiko.run(path)
    when 'eoswinPatients'
      Importers.Eoswin.Patients.run(path)
    else
      Winston.error('[Import] Upload stream: No suitable importer', options.importer)


getAuthorizedUser = (headers) ->
  user = Meteor.users.findOne(headers['x-user-id'])
  return false unless user and user.lastToken() is headers['x-auth-token']
  return false unless Roles.userIsInRole(user, ['admin', 'upload'])
  return user

post = Picker.filter (req, res) -> req.method is 'POST'
post.route '/api/upload/stream', (params, req, res, next) ->
  currentUser = getAuthorizedUser(req.headers)
  return res.end() unless currentUser
  Winston.info('[Import] Upload stream: Starting to receive file', { userId: currentUser._id })

  stream = temp.createWriteStream()
  req
    .on 'end', Meteor.bindEnvironment ->
      res.end()
      Meteor.defer ->
        Winston.info('[Import] Upload stream: Done receiving file', { userId: currentUser._id })
        parseUploadedFile stream.path,
          importer: req.headers['x-importer']
          user: currentUser
    .pipe(stream)
