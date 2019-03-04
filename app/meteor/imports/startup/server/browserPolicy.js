import { Meteor } from 'meteor/meteor'
import { WebApp, WebAppInternals } from 'meteor/webapp'
import flatten from 'lodash/flatten'
import helmet from 'helmet'
import uuidv4 from 'uuid/v4'

const self = "'self'"
const none = "'none'"

const getHelmetConfig = () => {
  const domain = Meteor.absoluteUrl().replace(/http(s)*:\/\//, '').replace(/\/$/, '')
  const domains = [
    domain,
    ...(process.env.VIRTUAL_HOST ? process.env.VIRTUAL_HOST.split(',') : [])
  ]

  const reportUri = `https://sentry.io/api/62218/security/?sentry_key=6af65eb19a37410f968d4e602ce572d7&sentry_release=${process.env.COMMIT_HASH}&sentry_environment=${process.env.NODE_ENV}`

  // Note: No wildcard origins allowed

  const helmetConfig = {
    contentSecurityPolicy: {
      browserSniff: false,
      blockAllMixedContent: true,
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
          'https://sentry.io/',
          'https://engine.montiapm.com'
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
          none
        ],
        frameSrc: [
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
        reportUri,
        sandbox: [
          'allow-same-origin',
          'allow-forms',
          'allow-scripts'
        ],
        scriptSrc: [
          self,
          'https://api.smooch.io',
          'https://cdn.smooch.io'
        ],
        styleSrc: [
          self,
          'https://cdn.smooch.io',
          // react-select needs a nonce
          (req, res) => `'nonce-${req.styleNonce}'`
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
      ctReportUri: reportUri
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
    setAllHeaders: true,
    xssFilter: {
      mode: 'block',
      reportUri
    },
    featurePolicy: {
      features: {
        geolocation: [ none ],
        midi: [ none ],
        syncXhr: [ none ],
        microphone: [ none ],
        camera: [ none ],
        magnetometer: [ none ],
        gyroscope: [ none ],
        speaker: [ none ],
        fullscreen: [ none ],
        payment: [ none ]
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    helmetConfig.contentSecurityPolicy.directives.connectSrc.push('http://localhost:3000')
    helmetConfig.contentSecurityPolicy.directives.connectSrc.push('ws://localhost:3000')
  }

  return helmetConfig
}

export default () => {
  Meteor.startup(() => {
    // Apparently the SRI hash of modules.js is incorrect in development
    if (process.env.NODE_ENV === 'production') {
      WebAppInternals.enableSubresourceIntegrity()
    }

    WebAppInternals.setInlineScriptsAllowed(false)

    WebApp.connectHandlers.use((req, res, next) => {
      const styleNonce = Buffer.from(uuidv4()).toString('base64')

      // A node req object has many more keys than meteor's request,
      // HACK: Attach the nonce to the request url as search fragment
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

    // JSS, used by material-ui, requires the csp-nonce meta tag
    WebAppInternals.registerBoilerplateDataCallback('rosalind/csp', (request, data, arch) => {
      // This request object contains a stripped req, with
      // the url parsed from the original request string.
      // url.hash contains # and the nonce we just attached.
      const styleNonce = request.url.hash.substr(1)
      data.head += `\n  <title>Connecting…</title>`
      data.head += `\n  <meta property="csp-nonce" content="${styleNonce}">`
      data.head += `\n  <meta name='robots' content='noindex, nofollow'>`
      data.head += `\n  <meta name='viewport' content='user-scalable=no, width=device-width, maximum-scale=1, initial-scale=1, minimum-scale=1'>`

      return true
    })
  })
}
