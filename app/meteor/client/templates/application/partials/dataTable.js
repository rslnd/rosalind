Template.dataTable.helpers({
  thisInsert() {
    return TAPi18n.__(this.table.collection._name + '.thisInsert');
  }
});

Template.dataTable.events({
  'click .this-insert'() {
    return Modal.show('modalAutoForm', { type: 'insert', collection: this.table.collection });
  }
});
