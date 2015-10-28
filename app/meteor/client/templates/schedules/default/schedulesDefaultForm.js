Template.schedulesDefaultForm.helpers({
  getDefaultScheduleForViewUser() {
    let doc = Schedules.findOne({userId: this.viewUser._id});
    if (doc) {
      return doc;
    } else {
      return {
        userId: this.viewUser._id,
      }
    }
  },
  formType() {
    let doc = Schedules.findOne({userId: this.viewUser._id});
    return doc ? 'update' : 'insert';
  }
});

AutoForm.hooks({
  afSchedulesDefaultForm: {
    before: {
      update(doc) {
        let ref;
        if (((ref = doc.$set) != null ? ref.items : void 0) != null) {
          doc.$set.items = _.without(doc.$set.items, null);
        }
        return doc;
      }
    }
  }
});
