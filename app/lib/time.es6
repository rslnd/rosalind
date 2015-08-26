Time = {}

Time.startOfToday = function() {
  return moment(new Date()).startOf('day').toDate();
}
