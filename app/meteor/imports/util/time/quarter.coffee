moment = require 'moment'

module.exports =
  q1: (m) ->
    start: moment(m).month(0).startOf('month')
    end: moment(m).month(3 - 1).endOf('month')

  q2: (m) ->
    start: moment(m).month(4 - 1).startOf('month')
    end: moment(m).month(6 - 1).endOf('month')

  q3: (m) ->
    start: moment(m).month(7 - 1).startOf('month')
    end: moment(m).month(9 - 1).endOf('month')

  q4: (m) ->
    start: moment(m).month(10 - 1).startOf('month')
    end: moment(m).month(12 - 1).endOf('month')

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

  isPrevious: (date, compareWith) ->
    @getQ(date) is @getQ(moment(compareWith).subtract(3, 'months')) and (
      moment(date).year() is moment(compareWith).year() or
      moment(date).year() is moment(compareWith).year() - 1)

  isSame: (date, compareWith) ->
    @getQ(compareWith) is @getQ(date) and
      moment(date).year() is moment(compareWith).year()

  isNext: (date, compareWith) ->
    @getQ(date) is @getQ(moment(compareWith).add(3, 'months')) and (
      moment(date).year() is moment(compareWith).year() or
      moment(date).year() is moment(compareWith).year() + 1)
