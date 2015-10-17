/* global Time: true */

Time = {};

Time.startOfToday = function() {
  return moment(new Date()).startOf('day').toDate();
};

Time.weekdays = function() {
  return {
    mon: { label: TAPi18n.__('time.monday'), offset: 0 },
    tue: { label: TAPi18n.__('time.tuesday'), offset: 1 },
    wed: { label: TAPi18n.__('time.wednesday'), offset: 2 },
    thu: { label: TAPi18n.__('time.thursday'), offset: 3 },
    fri: { label: TAPi18n.__('time.friday'), offset: 4 },
    sat: { label: TAPi18n.__('time.saturday'), offset: 5 }
  };
};
