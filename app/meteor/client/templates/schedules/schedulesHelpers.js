Template.schedules.helpers({
  selectedWeekOfYear() {
    if (Session.get('schedules-currentView')) {
      return moment(Session.get('schedules-currentView').start).format('W');
    }
  }
});
