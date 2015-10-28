Template.schedulesDefault.helpers({
  viewUser() {
    if (this.router.viewUser)
      return Meteor.users.findOneByIdOrUsername(this.router.viewUser);
    else
      return Meteor.users.findOne({});
  },
  schedulesDefaultOptions() {
    return {
      id: 'schedules-calendar',
      height: 'auto',
      firstDay: 1,
      hiddenDays: [ 0 ],
      slotDuration: '00:30:00',
      minTime: '06:00:00',
      maxTime: '22:00:00',
      lang: 'de',
      header: {
        left: 'prev,next today',
        center: 'title'
      },
      defaultView: 'agendaWeek',
      resourceAreaWidth: '0px',
      titleFormat: 'dddd, D. MMMM',
      timezone: 'false',
      events: function(start, end, timezone, callback) {
        var range = {start: start.toISOString(), end: end.toISOString()};
        Session.set('schedules-currentView', range);
        var events = Schedules.getEvents(range);

        // Make past days read-only
        events.push({
          start: moment(0),
          end: moment().startOf('day'),
          rendering: 'background',
          color: '#d1d1d1',
          overlap: false
        });

        // Mute past hours, but keep editable
        events.push({
          start: moment().startOf('day'),
          end: moment(),
          rendering: 'background',
          color: '#d1d1d1'
        });

        callback(events);
      },
      eventDrop: function(event, delta, revertFunc) {
        Schedules.updateEvent(event._id, event);
      },
      eventResize: function(event, delta, revertFunc) {
        Schedules.updateEvent(event._id, event);
      },
      schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
    };
  }
});

Meteor.startup(() => {
  Tracker.autorun(() => {
    Schedules.find({}).fetch();
    $('#schedules-calendar').fullCalendar('refetchEvents');
  });
});

Template.schedulesDefault.created = function() {
  Schedules.clientUpdateInterval = Meteor.setInterval(function() {
    $('#schedules-calendar').fullCalendar('refetchEvents');
  }, 15 * 60 * 1000);
};

Template.schedulesDefault.destroyed = function() {
  if (Schedules.clientUpdateInterval)
    Meteor.clearInterval(Schedules.clientUpdateInterval);
};
