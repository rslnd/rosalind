/* global __meteor_runtime_config__ */
import { Meteor } from 'meteor/meteor'
import { WebApp, WebAppInternals } from 'meteor/webapp'
import crypto from 'crypto'
import { Autoupdate } from 'meteor/autoupdate'
import helmet from 'helmet'
import uuidv4 from 'uuid/v4'

const self = "'self'"
const none = "'none'"

// TODO: Disable inline scripts when clinical:env is removed
// WebAppInternals.setInlineScriptsAllowed(false)

const getHelmetConfig = () => {
  const domain = Meteor.absoluteUrl().replace(/http(s)*:\/\//, '').replace(/\/$/, '')
  const s = Meteor.absoluteUrl().match(/(?!=http)s(?=:\/\/)/) ? 's' : ''
  const runtimeConfig = Object.assign(__meteor_runtime_config__, Autoupdate)

  // Debug hash generation
  // console.log(JSON.stringify(runtimeConfig))

  const runtimeConfigHash = crypto.createHash('sha256').update(`__meteor_runtime_config__ = JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(runtimeConfig))}"))`).digest('base64')

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
          'https://*.smooch.io',
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

  return helmetConfig
}

// TODO: Integrate with above when helmet v4 is ready
const policyToString = o =>
Object.keys(o)
  .map(k => ({ k, v: o[k] }))
  .map(({ k, v }) => `${k} ${v.join(' ')};`)

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
