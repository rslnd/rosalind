winston = Meteor.npmRequire('winston')
winstonSentry = Meteor.npmRequire('winston-sentry')
winstonLoggly = Meteor.npmRequire('winston-loggly')

@Winston = new winston.Logger
  levels: { debug: 3, info: 2, warn: 1, error: 0 }
  handleExeptions: true

Winston.add winston.transports.Console,
  colorize: true
  level: 'debug'
  colors: { debug: 'blue', info: 'green', warn: 'orange', error: 'red' }
  humanReadableUnhandledException: true

if process.env.SENTRY_KEY?
  Winston.add winstonSentry,
    level: 'warn'
    dsn: process.env.SENTRY_KEY
    patchGlobal: true

if process.env.LOGGLY_KEY?
  Winston.add winston.transports.Loggly,
    level: 'debug'
    subdomain: process.env.LOGGLY_SUBDOMAIN
    inputToken: process.env.LOGGLY_KEY
    tags: ['Meteor']
    json: true

unless process.env.NODE_ENV is 'development'
  Winston.rewriters.push (level, msg, meta) ->
    if typeof meta is 'object' and meta.userId?
      user = Meteor.users.findOne(meta.userId)
      meta.username = user.username
      meta.fullName = user.fullNameWithTitle()
    return meta

Meteor.methods
  'winston/log': (args) ->
    check args,
      level: String,
      msg: String,
      meta: Match.Optional(Object)

    if @userId and process.env.NODE_ENV isnt 'development'
      user = Meteor.users.findOne(@userId)
      args.meta = {} unless args.meta?
      args.meta.userId = user._id
      args.meta.username = user.username
      args.meta.fullName = user.fullNameWithTitle()

    Winston.log(args.level, args.msg, args.meta)

  getSentryClientKey: ->
    process.env.SENTRY_KEY.replace(/\:\w+/, '') if process.env.SENTRY_KEY?
