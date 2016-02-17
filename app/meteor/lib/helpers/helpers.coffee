@Helpers ||= {}

Helpers.person = (idOrUsername, collection) ->
  if idOrUsername?.collection()
    idOrUsername

  else if collection
    collection = Mongo.Collection.get(collection)
    collection.findOne(_id: idOrUsername)

  else
    Meteor.users.findOneByIdOrUsername(idOrUsername)

Helpers.findOneByIdAndCollection = (id, collection) ->
  return id if typeof id is 'object'
  collection = Mongo.Collection.get(collection) if typeof collection is 'string'
  collection.findOne(id)

Helpers.getFirstName = (user, collection) ->
  Helpers.person(user, collection)?.firstName()

Helpers.getFullName = (user, collection) ->
  Helpers.person(user, collection)?.fullName()

Helpers.getFullNameWithTitle = (user, collection) ->
  Helpers.person(user, collection)?.fullNameWithTitle()

Helpers.getShortname = (user, collection) ->
  Helpers.person(user, collection)?.shortname()

Helpers.calendar = (date) ->
  moment(date).calendar()

Helpers.recent = (date) ->
  moment().range(date, moment()).diff('hours') < 4

Helpers.birthday = (date) ->
  return unless date
  date = moment(date)
  return if date < moment().subtract(150, 'years')

  age = moment().diff(date, 'years')
  formatted = date.format('D. MMMM YYYY')
  "#{formatted} (#{age} Jahre)"

Helpers.parseNewlines = (text) ->
  return unless text and typeof text is 'string'
  text
    .split('\\r\\n').join('\n')
    .split('\\r').join('\n')
    .split('\\n').join('\n')

# Split phone number at whitespaces. If the word contains a number,
# replace all letters 'O' or 'o' with zeroes. Join back together.
Helpers.zerofix = (telephone) ->
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

if Meteor.isClient
  UI.registerHelper('getFirstName', (context) -> Helpers.getFirstName(context))
  UI.registerHelper('getFullName', (context) -> Helpers.getFullName(context))
  UI.registerHelper('getFullNameWithTitle', (context) -> Helpers.getFullNameWithTitle(context))
  UI.registerHelper('getShortname', (context) -> Helpers.getShortname(context))
  UI.registerHelper('calendar', (context) -> Helpers.calendar(context))
  UI.registerHelper('recent', (context) -> Helpers.recent(context))
  UI.registerHelper('birthday', (context) -> Helpers.birthday(context))
  UI.registerHelper('zerofix', (context) -> Helpers.zerofix(context))
  UI.registerHelper('true', -> true)
  UI.registerHelper('false', -> false)
