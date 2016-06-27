{ Meteor } = require 'meteor/meteor'
{ sAlert } = require 'meteor/juliancwirko:s-alert'
{ ImportFiles } = require '/imports/api/importers'

Template.systemImporters.onCreated ->
  @subscribe('import.jobs')
  @currentUpload = new ReactiveVar(false)

Template.systemImporters.helpers
  currentUpload: ->
    Template.instance().currentUpload.get()

Template.systemImporters.events
  'click [rel="upload"]': (e, template) ->
    files = $('#file')[0]
    if file.files and file.files[0]
      options =
        file: file.files[0]
        streams: 'dynamic'
        chunkSize: 'dynamic'
        meta:
          importer: $('select[name="importer"]').val()

      upload = ImportFiles.insert(options, false)

      upload.on 'start', ->
        console.log('[System][Importers] Start Upload')
        template.currentUpload.set(@)

      upload.on 'end', (error, result) ->
        if error
          console.log('[System][Importers] Upload failed', error)
          sAlert.error('Error during upload: ' + error)
        else
          console.log('[System][Importers] Upload succeeded')
          sAlert.success('File "' + result.name + '" successfully uploaded')

        template.currentUpload.set(false)

      upload.start()
