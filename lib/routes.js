Router.configure({
  layoutTemplate: 'layout'
});

Router.map(function() {

  this.route('/inboundCalls', {
    waitOn: function() {
      return Meteor.subscribe('inboundCalls');
    },
    data: function() {
      return {
        inboundCalls: InboundCalls.find({})
      };
    }
  });

  this.route('/inboundCalls/new', function() {
    this.render('newInboundCall');
  });

  this.route('/', function() {
    this.render('dashboard');
  });

});
