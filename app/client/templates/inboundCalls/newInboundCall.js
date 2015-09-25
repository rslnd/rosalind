AutoForm.hooks({
  insertInboundCallForm: {
    onSubmit: function(insertDoc, updateDoc, currentDoc) {
      InboundCalls.insert(insertDoc);
      this.done();
      return false;
    }
  }
});
