Router.route('/schedules/default/:idOrUsername?', {
  template: 'schedulesDefault',
  subscriptions() { Meteor.subscribe('schedules'); },
  data() {
    return {
      schedulesDefault: Meteor.users.find({}),
      router: { viewUser: this.params.idOrUsername },
    };
  }
});
