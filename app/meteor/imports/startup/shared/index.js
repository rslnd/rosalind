import sentry from './sentry'
import locale from './locale'

var funcs = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  debug: (console.debug || console.log).bind(console)
}

function patchLog(tag) {
  Object.keys(funcs).forEach(function(k) {
    console[k] = function() {
      // Need to pass through the magic string that
      // is logged after startup to signal to the
      // dev proxy to accept connections.
      // https://github.com/meteor/meteor/issues/5022
      if (arguments[0] === 'LISTENING') {
        funcs[k].apply(console, arguments)
      } else {
        funcs[k].apply(console, [tag, ...arguments])
      }
    }
  })
}

const logTag = `${Meteor.settings.public.CUSTOMER_PREFIX || 'dev'}>`
patchLog(logTag)


export default () => {
  // const _log = console.log
  // const _debug = console.debug
  // const _error = console.error

  // console.log = logPrefix(_log)
  // console.debug = logPrefix(_debug)
  // console.error = logPrefix(_error)

  sentry()
  locale()
}


const logPrefix = (fn) => {
  const prefix =
    Meteor.settings.public.CUSTOMER_PREFIX ||
    'dev'

  return (...args) => {
    fn.apply(console, [prefix, ...args])
  }
}
