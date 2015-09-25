Template.comments.helpers({
  comments() {
    return Comments.find({docId: this._id}).fetch();
  }
});

UI.registerHelper('commentCount', function() {
  return Comments.find({docId: this._id}).count();
});

UI.registerHelper('hasComments', function() {
  return Comments.find({docId: this._id}).count() > 0;
});

UI.registerHelper('humanCommentCount', function() {
  let count = Comments.find({docId: this._id}).count();
  let human = TAPi18n.__('ui.comment', {count});
  return count + ' ' + human;
});

Template.comments.events({
  'submit form.add-comment': function(e) {
    let input = $(e.target).find('.add-comment-body');
    Comments.insert({body: input.val(), docId: this._id});
    input.val('');
    return false;
  }
});
