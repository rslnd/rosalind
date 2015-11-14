Template.editLink.events({
  'click a'() {
    return Modal.show('modalAutoForm', { type: 'update', collection: this.collection, doc: this });
  }
});
