Template.schedules.helpers({
  schedulesOptions() {
    return {
      height: 'auto',
      hiddenDays: [ 0 ],
      slotDuration: '00:30:00',
      minTime: '06:00:00',
      maxTime: '22:00:00',
      lang: 'de',
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'agendaWeek,agendaDay'
      },
      defaultView: 'agendaWeek',
      events: function(start, end, timezone, callback) {
        Session.set('schedules-currentView', {start: start.toISOString(), end: end.toISOString()});
        var events = [];
        callback(events);
      },
      id: 'schedules-calendar',
      autoruns: [
        function () {
          console.log('user defined autorun function executed!');
        }
      ]
    };
  }
});
