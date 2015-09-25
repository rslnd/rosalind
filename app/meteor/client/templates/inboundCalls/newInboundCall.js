AutoForm.hooks({
  insertInboundCallForm: {
    onSubmit: function(insertDoc) {
      InboundCalls.insert(insertDoc);
      this.done();
      return false;
    }
  }
});
