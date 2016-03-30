{ InboundCalls } = require '/imports/api/inboundCalls'

Template.newInboundCall.helpers
  collection: ->
    InboundCalls

AutoForm.hooks
  insertInboundCallForm:
    onSubmit: (insertDoc) ->
      InboundCalls.insert(insertDoc)
      @done()
      false
