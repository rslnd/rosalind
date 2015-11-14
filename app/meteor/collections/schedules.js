/* global Schedules: true */

Schedules = new Mongo.Collection('schedules');
Ground.Collection(Schedules);


Schema.Schedules = new SimpleSchema({
  userId: {
    type: SimpleSchema.RegEx.Id,
    index: 1,
    optional: true
  },
  available: {
    type: Boolean,
    index: 1,
    optional: true
  },
  validFrom: {
    type: Date,
    optional: true,
  },
  validUntil: {
    type: Date,
    optional: true,
  },
  schedule: {
    type: Array,
    maxCount: 7,
    optional: true,
  },
  'schedule.$': {
    type: Object
  },
  'schedule.$.day': {
    type: String,
    autoform: {
      options: _.map(Time.weekdays(), (v, k) => { return {label: v.label, value: k};})
    }
  },
  'schedule.$.shift': {
    type: Array
  },
  'schedule.$.shift.$': {
    type: Object,
    optional: true
  },
  'schedule.$.shift.$.start.h': {
    type: Number,
    min: 0,
    max: 23
  },
  'schedule.$.shift.$.start.m': {
    type: Number,
    min: 0,
    max: 59,
    optional: true
  },
  'schedule.$.shift.$.end.h': {
    type: Number,
    min: 0,
    max: 23
  },
  'schedule.$.shift.$.end.m': {
    type: Number,
    min: 0,
    max: 59,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: Util.autoCreatedAt,
    optional: true
  },
  createdBy: {
    type: String,
    autoValue: Util.autoCreatedBy,
    optional: true
  }
});

Schedules.helpers({
  isValid(range) {
    return true;
  },
  totalHoursWeek() {
    return _.reduce(this.schedule, (total, day) => {
      let hours = this.totalHoursDay(day);
      if (! hours)
        hours = 0;

      return total += hours;
    }, 0);
  },
  totalHoursDay(day) {
    if (typeof day === 'string')
      day = this.getDay(day);
    if (day) {
      return _.reduce(_.map(day.shift, (shift) => {
        if (shift && shift.end && shift.start) {
          var h = shift.end.h - shift.start.h;
          if (shift.end.m)
            h += (shift.end.m / 60);
          if (shift.start.m)
            h -= (shift.start.m / 60);
          return h;
        }
      }), (total, hours) => {
        return total + hours;
      }, 0);
    }
  },
  getDay(weekday) {
    return _.find(this.schedule, (day) => {
      return day.day === weekday;
    });
  }
});

Schedules.getResources = function() {
  return _.map(_.keys(Meteor.users.byGroup()), (resourceId) => { return { id: resourceId, title: resourceId }; });
};

Schedules.getEvents = function(range) {
  let defaultSchedules = Schedules.find({}).fetch();
  let events = [];


  _.each(defaultSchedules, (defaultSchedule) => {
    let user = Meteor.users.findOne(defaultSchedule.userId);

    if (! defaultSchedule.isValid(range))
      return;

    _.each(defaultSchedule.schedule, function(dailySchedule) {
      if (dailySchedule) {
        let currentDay = moment().startOf('isoWeek').add(Time.weekdays()[dailySchedule.day].offset, 'days');

        _.each(dailySchedule.shift, (shift) => {
          if (shift && shift.start && shift.end) {
            let start = currentDay.clone().add(shift.start.h, 'hours').add(shift.start.m, 'minutes');
            let end = currentDay.clone().add(shift.end.h, 'hours').add(shift.end.m, 'minutes');

            events.push({
              start: start,
              end: end,
              editable: true,
              resourceId: user.profile.group || 'none',
              title: user.fullNameWithTitle(),
              defaultScheduleId: defaultSchedule._id,
            });
          }
        });
      }
    });
  });

  return events;
};

Schedules.updateEvent = function(_id, e) {
  console.warn('updating events not implemented');
  // e.schedule.start = e.start.toDate();
  // e.schedule.end = e.end.toDate();
  // 
  // e.schedule = _.omit(e.schedule, '_id');
  // 
  // Schedules.update(_id, { $set: e.schedule });
};

Meteor.startup(() => {
  Schedules.attachSchema(Schema.Schedules);
});
