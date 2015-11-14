Template.commentsModal.helpers({
  'collectionItem'() {
    return _.singularize(this.collection()._name);
  }
});
