temp = Meteor.npmRequire('temp').track()

allowedImporters = [
  'terminiko'
  'eoswinPatients'
  'eoswinReports'
]

onUploaded = Meteor.bindEnvironment (options) ->
  Winston.info('[Import] Upload stream: Done receiving file', { userId: options.userId })
  job = new Job(Jobs.Import, options.importer, options).save()

getAuthorizedUser = (headers) ->
  user = Meteor.users.findOne(headers['x-user-id'])
  return false unless user and user.lastToken() is headers['x-auth-token']
  return false unless Roles.userIsInRole(user, ['admin', 'upload'])
  return user

post = Picker.filter (req, res) -> req.method is 'POST'
post.route '/api/upload/stream', (params, req, res, next) ->

  currentUser = getAuthorizedUser(req.headers)
  importer = req.headers['x-importer']
  meta = req.headers['x-meta']
  if meta
    try
      meta = JSON.parse(meta)
    catch e
      Winston.error('[Import] Upload stream: Illegal meta data: ' + meta)


  return res.end('not authorized') unless currentUser
  return res.end('importer not allowed') unless _.contains(allowedImporters, importer)

  Winston.info('[Import] Upload stream: Starting to receive file', { userId: currentUser._id })

  stream = temp.createWriteStream()

  options =
    path: stream.path
    userId: currentUser._id
    importer: importer
    meta: meta

  req
    .on 'end', ->
      res.end()
      onUploaded(options)
    .pipe(stream)
