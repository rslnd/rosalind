@Time = {}

Time.startOfToday = ->
  moment().startOf('day').toDate()

Time.endOfToday = ->
  moment().endOf('day').toDate()


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
