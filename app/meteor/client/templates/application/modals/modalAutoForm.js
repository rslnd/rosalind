Template.modalAutoForm.helpers({
  title() {
    let collectionName = '';

    if (typeof this.collection === 'object')
      collectionName = this.collection._name;

    if (typeof this.collection === 'function')
      collectionName = this.collection()._name;

    return TAPi18n.__(collectionName + '.this' + s.capitalize(this.type));
  }
});

AutoForm.hooks({
  modalAutoForm: {
    onSuccess() {
      Modal.hide();
    }
  }
});
