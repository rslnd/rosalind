@Time = {}

Time.startOfToday = ->
  moment().startOf('day').toDate()

Time.endOfToday = ->
  moment().endOf('day').toDate()

Time.dateToDay = (date) ->
  return unless date
  date = moment(date)
  year = date.year()
  month = date.month() + 1
  day = date.date() # no typo
  { year, month, day }

Time.zeroIndexMonth = (day) ->
  return unless day
  if day?.month and not day?.zeroIndexMonth
    day.month -= 1
    day.zeroIndexMonth = true
  return day

Time.dayToDate = (day) ->
  day = Time.zeroIndexMonth(day)
  moment(day).toDate()

Time.dayToday = (day) ->
  return unless day?.day and day?.month
  day = Time.zeroIndexMonth(day)
  today = moment()
  return today.date() is day.day and
    today.month() is day.month

Time.weekdays = ->
  mon: { label: TAPi18n.__('time.monday'), offset: 0 }
  tue: { label: TAPi18n.__('time.tuesday'), offset: 1 }
  wed: { label: TAPi18n.__('time.wednesday'), offset: 2 }
  thu: { label: TAPi18n.__('time.thursday'), offset: 3 }
  fri: { label: TAPi18n.__('time.friday'), offset: 4 }
  sat: { label: TAPi18n.__('time.saturday'), offset: 5 }

Time.hm = (float) ->
  h = Math.floor(float)
  m = (float - h) * 60
  { h, m }

Time.format = (format, t) ->
  s = ''
  switch format
    when 'h[h]( m[m])'
      s += t.h + 'h'
      s += ' ' + Math.round(t.m) + 'm' if (t?.m > 0)
    else
      s = JSON.stringify(data)
  s
