import moment from 'moment-timezone'
import temp from 'temp'
import { Meteor } from 'meteor/meteor'
import { Picker } from 'meteor/meteorhacks:picker'
import { Users } from '../../users'
import { Jobs } from '../../jobs'
import { isAllowedImporter } from '../allowedImporters'

module.exports = ->
  temp.track()

  onUploaded = Meteor.bindEnvironment (options) ->
    console.log('[Import] Upload stream: Done receiving file', options)
    job = new Job(Jobs.import, options.importer, options)
      .retry
        until: moment().add(1, 'hour').toDate()
        wait: 1000
        backoff: 'exponential'
      .save()

  getAuthorizedUser = (headers) ->
    user = Users.findOne(headers['x-user-id'])
    return false unless user and user.lastToken() is headers['x-auth-token']
    return false unless Roles.userIsInRole(user, ['admin', 'upload'])
    return user

  post = Picker.filter (req, res) -> req.method is 'POST'
  post.route 'api/upload/stream', (params, req, res, next) ->

    currentUser = getAuthorizedUser(req.headers)
    importer = req.headers['x-importer']
    meta = req.headers['x-meta']
    if meta
      try
        meta = JSON.parse(meta)
      catch e
        console.error('[Import] Upload stream: Illegal meta data: ' + meta)


    return res.end('not authorized') unless currentUser
    return res.end('importer not allowed') unless isAllowedImporter(importer)

    stream = temp.createWriteStream()

    options =
      path: stream.path
      userId: currentUser._id
      importer: importer
      meta: meta

    console.log('[Import] Upload stream: Starting to receive file', options)

    req
      .on 'end', ->
        res.end()
        onUploaded(options)
      .pipe(stream)
