Meteor.publishComposite('schedules', function(options = {}) {
  check(options, Object);

  if(this.userId && Roles.userIsInRole(this.userId, ['schedules', 'admin'], Roles.GLOBAL_GROUP)) {

    return {
      find: () => Schedules.find({}),
      children: [
        {
          find: (schedule) => {
            return Meteor.users.find({_id: schedule.userId});
          }
        }
      ]
    };
  }
});
