moment = require 'moment'

module.exports =
  q1: (m) ->
    start: moment(m).month('Jan').startOf('month')
    end: moment(m).month('Mar').endOf('month')

  q2: (m) ->
    start: moment(m).month('Apr').startOf('month')
    end: moment(m).month('Jun').endOf('month')

  q3: (m) ->
    start: moment(m).month('Jul').startOf('month')
    end: moment(m).month('Sep').endOf('month')

  q4: (m) ->
    start: moment(m).month('Oct').startOf('month')
    end: moment(m).month('Dec').endOf('month')

  isQ1: (m) ->
    q1 = @q1(m)
    moment(m).isBetween(q1.start, q1.end, null, '[]')

  isQ2: (m) ->
    q2 = @q2(m)
    moment(m).isBetween(q2.start, q2.end, null, '[]')

  isQ3: (m) ->
    q3 = @q3(m)
    moment(m).isBetween(q3.start, q3.end, null, '[]')

  isQ4: (m) ->
    q4 = @q4(m)
    moment(m).isBetween(q4.start, q4.end, null, '[]')

  getQ: (m) ->
    m = moment(m)
    return 4 if @isQ4(m)
    return 3 if @isQ3(m)
    return 2 if @isQ2(m)
    return 1 if @isQ1(m)

  quarter: (date) ->
    m = moment(date)
    year = m.year()
    q = @getQ(m)
    isSame = @isSame(m)
    isNext = @isNext(m)
    isPrevious = @isPrevious(m)
    { year, q, isSame, isNext, isPrevious }

  isPrevious: (date) ->
    @getQ(date) is @getQ(moment().subtract(3, 'months'))

  isSame: (date) ->
    @getQ() is @getQ(date)

  isNext: (date) ->
    @getQ(date) is @getQ(moment().add(3, 'months'))
