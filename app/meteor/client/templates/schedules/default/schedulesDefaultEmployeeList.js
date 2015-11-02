Template.schedulesDefaultEmployeeList.helpers({
  employeeGroups() {
    return Meteor.users.byGroup({'profile.employee': true});
  },
  linkToDefaultScheduleForUser() {
    return '/schedules/default/' + this.username;
  },
  totalHoursWeek() {
    let user = this;
    let defaultSchedule = Schedules.findOne({userId: this._id});
    if (defaultSchedule) {
      let hm = Time.hm(defaultSchedule.totalHoursWeek());
      return Time.format('h[h]( m[m])', hm);
    } else {
      return '0h';
    }
  }
});
