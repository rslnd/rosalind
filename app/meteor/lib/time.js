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

Time.hm = function(float) {
  let h = Math.floor(float);
  let m = (float - h) * 60;
  return { h, m };
}

Time.format = function(format, t) {
  let s = '';
  switch(format) {
    case 'h[h]( m[m])':
      s += t.h + 'h';
      if (t.m && t.m > 0)
        s += ' ' + Math.round(t.m) + 'm';
      break;
    default:
      s = JSON.stringify(data);
  }
  return s;
}
