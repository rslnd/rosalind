moment = require 'moment'
require 'moment-range'
{ Mongo } = require 'meteor/mongo'
{ Spacebars } = require 'meteor/spacebars'
{ TAPi18n } = require 'meteor/tap:i18n'
Time = require '/imports/util/time'
{ Users } = require '/imports/api/users'
{ Comments } = require '/imports/api/comments'

module.exports =
  person: (idOrUsername, collection) ->
    if idOrUsername and typeof idOrUsername.collection is 'function'
      idOrUsername

    else if collection
      collection = Mongo.Collection.get(collection)
      collection.findOne(_id: idOrUsername)

    else
      Users.methods.findOneByIdOrUsername(idOrUsername)

  findOneByIdAndCollection: (id, collection) ->
    return id if typeof id is 'object'
    collection = Mongo.Collection.get(collection) if typeof collection is 'string'
    collection.findOne(id)

  getFirstName: (user, collection) ->
    @person(user, collection)?.firstName()

  getFullName: (user, collection) ->
    @person(user, collection)?.fullName()

  getFullNameWithTitle: (user, collection) ->
    @person(user, collection)?.fullNameWithTitle()

  getShortname: (user, collection) ->
    @person(user, collection)?.shortname()

  floor: (number) ->
    return unless number
    Math.floor(number)

  roundToTwo: (number) ->
    return unless number
    parseFloat(parseFloat(number).toFixed(2))

  roundToOne: (number) ->
    return unless number
    parseFloat(parseFloat(number).toFixed(1))

  calendar: (date) ->
    moment(date).calendar()

  calendarDay: (day) ->
    date = moment(Time.dayToDate(day))
    Time.date(date, weekday: true)

  recent: (date) ->
    moment().range(date, moment()).diff('hours') < 4

  birthday: (date) ->
    return unless date

    date = Time.zeroIndexMonth(date)

    date = moment(date)
    return if date < moment().subtract(150, 'years')

    age = moment().diff(date, 'years')
    formatted = Time.date(date, weekday: false)
    "#{formatted} (#{age} Jahre)"

  weekOfYear: (date) ->
    return unless date
    if date.year and date.month and date.day
      date = Time.dayToDate(date)

    weekOfYear = moment(date).format('W')
    [TAPi18n.__('ui.weekOfYear'), weekOfYear].join(' ')

  parseNewlines: (text) ->
    return unless text and typeof text is 'string'
    text
      .split('\\r\\n').join('\n')
      .split('\\r').join('\n')
      .split('\\n').join('\n')

  # Split phone number at whitespaces. If the word contains a number,
  # replace all letters 'O' or 'o' with zeroes. Join back together.
  zerofix: (telephone) ->
    return unless telephone?
    telephone = _.map telephone.split(/\s/g), (word) ->
      if word.match(/\d/g)
        word.replace(/o/gi, '0')
      else word
    telephone = telephone.join(' ')

    # If it's just a long string of digits, split into groups of 4
    if (telephone.indexOf(' ') is -1 and telephone.match(/\d/g))
      telephone.match(/.{1,4}/g).join(' ')
    else
      telephone

  stringify: (blob, pretty = true) ->
    if blob
      try
        if pretty
          JSON.stringify(blob, null, 2)
        else
          JSON.stringify(blob)
      catch e
        blob

  formatInsuranceId: (str) ->
    return unless str
    return str.slice(0, 4) if str.length is 10
    return str

  noValue: ->
    noValue = TAPi18n.__('ui.noValue')
    noValue = '<span class="text-muted">' + noValue + '</span>'
    Spacebars.SafeString(noValue)
