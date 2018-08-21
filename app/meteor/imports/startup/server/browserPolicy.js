/* global __meteor_runtime_config__ */
import { Meteor } from 'meteor/meteor'
import { WebApp } from 'meteor/webapp'
import crypto from 'crypto'
import { Autoupdate } from 'meteor/autoupdate'
import helmet from 'helmet'

const setBrowserPolicy = () => {
  const domain = Meteor.absoluteUrl().replace(/http(s)*:\/\//, '').replace(/\/$/, '')
  const s = Meteor.absoluteUrl().match(/(?!=http)s(?=:\/\/)/) ? 's' : ''
  const runtimeConfig = Object.assign(__meteor_runtime_config__, Autoupdate)

  console.log(JSON.stringify(runtimeConfig))

  const runtimeConfigHash = crypto.createHash('sha256').update(`__meteor_runtime_config__ = JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(runtimeConfig))}"))`).digest('base64')

  const self = "'self'"
  const none = "'none'"

  const cspReportUri = 'https://rosalind.report-uri.com/r/d/csp/enforce'
  const ctReportUri = 'https://rosalind.report-uri.com/r/d/ct/enforce'
  const xssReportUri = 'https://rosalind.report-uri.com/r/d/xss/enforce'

  const helmetConfig = {
    contentSecurityPolicy: {
      browserSniff: false,
      directives: {
        baseUri: [
          none
        ],
        blockAllMixedContent: true,
        childSrc: [
          self
        ],
        connectSrc: [
          self,
          `http${s}://${domain}`,
          `ws${s}://${domain}`,
          'https://*.rslnd.com',
          'wss://*.smooch.io',
          'https://*.smooch.io',
          'https://*.sentry.io'
        ],
        defaultSrc: [
          none
        ],
        fontSrc: [
          self,
          'https://*.bootstrapcdn.com',
          'https://*.smooch.io'
        ],
        formAction: [
          self
        ],
        frameAncestors: [
          self
        ],
        frameSrc: [
          self,
          'https://*.smooch.io'
        ],
        imgSrc: [
          self,
          'https://*.smooch.io',
          'https://www.gravatar.com'
        ],
        manifestSrc: [
          none
        ],
        mediaSrc: [
          none
        ],
        objectSrc: [
          none
        ],
        reportUri: cspReportUri,
        sandbox: [
          'allow-same-origin',
          'allow-forms',
          'allow-scripts'
        ],
        scriptSrc: [
          self,
          `'sha256-${runtimeConfigHash}'`,
          'https://*.smooch.io'
        ],
        styleSrc: [
          self,
          "'unsafe-inline'", // TODO: Replace with SRI hash
          'https://*.smooch.io'
        ],
        workerSrc: [
          none
        ]
      }
    },
    dnsPrefetchControl: true,
    expectCt: {
      enforce: false,
      maxAge: 604800,
      ctReportUri
    },
    frameguard: {
      action: 'deny'
    },
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noCache: true,
    noSniff: true,
    referrerPolicy: {
      policy: 'no-referrer'
    },
    xssFilter: {
      mode: 'block',
      reportUri: xssReportUri
    }
  }

  WebApp.connectHandlers.use(helmet(helmetConfig))

  // Until helmet v4 is ready
  const featurePolicy = {
    accelerometer: [ none ],
    autoplay: [ none ],
    camera: [ none ],
    'encrypted-media': [ none ],
    geolocation: [ none ],
    gyroscope: [ none ],
    magnetometer: [ none ],
    microphone: [ none ],
    midi: [ none ],
    payment: [ none ],
    speaker: [ none ],
    'sync-xhr': [ none ],
    usb: [ none ],
    vr: [ none ]
  }

  const policyToString = o =>
    Object.keys(o)
      .map(k => ({ k, v: o[k] }))
      .map(({ k, v }) => `${k} ${v.join(' ')};`)

  WebApp.connectHandlers.use((req, res, next) => {
    res.setHeader('Feature-Policy', policyToString(featurePolicy))
    next()
  })
}

export default () => {
  Meteor.startup(setBrowserPolicy)
}
