{ Roles } = require 'meteor/alanning:roles'
{ Jobs } = require '/imports/api/jobs'
{ Users } = require '/imports/api/users'
{ isAllowedImporter } = require '../allowedImporters'
ImportFiles = require '../collection'

onAfterUpload = (fileRef) ->
  console.log('[Import] Upload stream: Done receiving file', fileRef)

  user = Users.findOne(fileRef.userId)

  unless isAllowedImporter(fileRef.meta.importer)
    return console.log('[Import] Upload stream: Importer not allowed:', fileRef.meta.importer)

  unless user and Roles.userIsInRole(user, ['admin', 'upload'])
    return console.log('[Import] Upload stream: User not allowed:', fileRef.userId)

  options =
    path: fileRef.path
    userId: fileRef.userId
    importer: fileRef.meta.importer
    meta: fileRef.meta

  job = new Job(Jobs.import, fileRef.meta.importer, options)
    .retry
      until: moment().add(1, 'hour').toDate()
      wait: 1000
      backoff: 'exponential'
    .save()

module.exports = ->
  ImportFiles.addListener('afterUpload', onAfterUpload)
