Template.inboundCall.events({
  'click .resolve'() {
    InboundCalls.softRemove(this._id);
  },
  'click .unresolve'(e) {
    InboundCalls.restore(this._id);

    let pendingComment = $(e.target).parents('.modal').find('.add-comment-body').val();
    if (pendingComment.length > 0)
      Comments.insert({body: pendingComment, docId: this._id});

    Modal.hide();
  }
});

Template.inboundCallsUnresolve.events({
  'click .unresolve'() {
    InboundCalls.restore(this._id);
  }
});

UI.registerHelper('zerofix', (context) => {
  return Helpers.zerofix(context);
});
