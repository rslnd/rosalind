/* global __meteor_runtime_config__ */
import { Meteor } from 'meteor/meteor'
import { WebApp, WebAppInternals } from 'meteor/webapp'
import flatten from 'lodash/flatten'
import crypto from 'crypto'
import helmet from 'helmet'
import uuidv4 from 'uuid/v4'

const self = "'self'"
const none = "'none'"

// TODO: Disable inline scripts when clinical:env is removed
// WebAppInternals.setInlineScriptsAllowed(false)

const getHelmetConfig = () => {
  const domain = Meteor.absoluteUrl().replace(/http(s)*:\/\//, '').replace(/\/$/, '')
  const domains = [
    domain,
    ...(process.env.VIRTUAL_HOST ? process.env.VIRTUAL_HOST.split(',') : [])
  ]
  const runtimeConfig = Object.assign(
    __meteor_runtime_config__,
    { isModern: Meteor.isModern }
  )

  // Debug hash generation
  // console.log(JSON.stringify(runtimeConfig))

  const runtimeConfigHash = crypto.createHash('sha256').update(`__meteor_runtime_config__ = JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(runtimeConfig))}"))`).digest('base64')

  const cspReportUri = 'https://rosalind.report-uri.com/r/d/csp/enforce'
  const ctReportUri = 'https://rosalind.report-uri.com/r/d/ct/enforce'
  const xssReportUri = 'https://rosalind.report-uri.com/r/d/xss/enforce'

  // Note: No wildcard origins allowed

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
          ...flatten(domains.map(d => [
            `https://${d}`,
            `wss://${d}`
          ])),
          `https://${process.env.SMOOCH_APP_ID}.config.smooch.io/`,
          'wss://api.smooch.io',
          'https://api.smooch.io',
          'https://sentry.io/'
        ],
        defaultSrc: [
          none
        ],
        fontSrc: [
          self,
          'https://cdn.smooch.io'
        ],
        formAction: [
          self
        ],
        frameAncestors: [
          self
        ],
        frameSrc: [
          self,
          'https://cdn.smooch.io'
        ],
        imgSrc: [
          self,
          'https://app.smooch.io',
          'https://cdn.smooch.io',
          'https://media.smooch.io',
          'https://www.gravatar.com/avatar/9551b5ac12bb6a04fd48d1dcb51f046a.png'
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
          'https://api.smooch.io',
          'https://cdn.smooch.io'
        ],
        styleSrc: [
          self,
          'https://cdn.smooch.io',
          // TODO: Can't use unsafe-inline and nonce- in the same clause
          // Replace unsafe-inline with nonce for react-select asap
          "'unsafe-inline'"
          // (req, res) => `'nonce-${req.styleNonce}'`
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
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
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

  if (process.env.NODE_ENV === 'development') {
    helmetConfig.contentSecurityPolicy.directives.connectSrc.push('http://localhost:3000')
    helmetConfig.contentSecurityPolicy.directives.connectSrc.push('ws://localhost:3000')
  }

  return helmetConfig
}

// TODO: Integrate with above when helmet v4 is ready
const policyToString = o =>
Object.keys(o)
  .map(k => ({ k, v: o[k] }))
  .map(({ k, v }) => `${k} ${v.join(' ')}`)
  .join('; ')

const getFeaturePolicyHeader = () => {
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

  return policyToString(featurePolicy)
}

export default () => {
  Meteor.startup(() => {
    // BUG: SRI Hash for module.js is incorrect in development
    if (process.env.NODE_ENV === 'production') {
      WebAppInternals.enableSubresourceIntegrity()
    }

    WebApp.connectHandlers.use((req, res, next) => {
      const styleNonce = new Buffer(uuidv4()).toString('base64')

      // A node req object has many more keys than meteor's request,
      // HACK: attach the nonce to the request url as search fragmant
      // so that it survives the transformation from req to request.
      // Servers never receive url fragments from clients.
      req.url = req.url + '#' + styleNonce

      // Also attach the same nonce to the req object to build the csp
      req.styleNonce = styleNonce

      next()
    })

    WebApp.connectHandlers.use((req, res, next) => {
      helmet(getHelmetConfig())(req, res, next)
    })

    WebApp.connectHandlers.use((req, res, next) => {
      res.setHeader('Feature-Policy', getFeaturePolicyHeader())
      next()
    })

    // JSS, used by material-ui, requires the csp-nonce meta tag
    WebAppInternals.registerBoilerplateDataCallback('rosalind/csp', (request, data, arch) => {
      // This request object contains a stripped req, with
      // the url parsed from the original request string.
      // url.hash contains # and the nonce we just attached.
      const styleNonce = request.url.hash.substr(1)
      data.head += `\n  <meta property="csp-nonce" content="${styleNonce}">`

      return true
    })
  })
}
