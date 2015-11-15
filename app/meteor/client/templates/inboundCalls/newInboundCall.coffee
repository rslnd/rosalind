AutoForm.hooks
  insertInboundCallForm:
    onSubmit: (insertDoc) ->
      InboundCalls.insert(insertDoc)
      @done()
      false
