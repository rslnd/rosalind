import { Meteor } from 'meteor/meteor'
import identity from 'lodash/identity'
import { WebApp, WebAppInternals } from 'meteor/webapp'
import flatten from 'lodash/flatten'
import helmet from 'helmet'
import { v4 as uuidv4}  from 'uuid'
import { Settings } from '../../api'

const self = "'self'"
const none = "'none'"

const mediaHosts = () => {
  const hosts = [
    process.env.MEDIA_S3_HOST, // LEGACY
    Settings.get('media.s3.host'), // LEGACY
    ...(process.env.MEDIA_S3_CONFIG
      ? JSON.parse(process.env.MEDIA_S3_CONFIG).map(c => c.host)
      : []
    ),
    ...(Settings.get('media.s3.config')
      ? Settings.get('media.s3.config').map(c => c.host)
      : []
    )
  ]

  const scheme = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') ? 'https://' : 'http://'
  return hosts.filter(identity).map(h => [scheme, h].join(''))
}

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
          ...mediaHosts(),
          `https://${process.env.SMOOCH_APP_ID}.config.smooch.io/`,
          'wss://api.smooch.io',
          'https://api.smooch.io',
          'https://sentry.io/',
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
          'blob:',
          'data:',
          ...mediaHosts(),
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
          'allow-scripts',
          'allow-modals' // needed for window.print()
        ],
        scriptSrc: [
          self,
          (req, res) => `'nonce-${req.nonce}'`,
          'https://api.smooch.io',
          'https://cdn.smooch.io'
        ],
        styleSrc: [
          self,
          'https://cdn.smooch.io',
          // react-select needs a nonce
          (req, res) => `'nonce-${req.nonce}'`
        ],
        // pdfjs renders in a worker (public/pdf.worker.min.js)
        workerSrc: [
          self
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
      maxAge: 63072000,
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

    // shadow-cljs
    helmetConfig.contentSecurityPolicy.directives.scriptSrc.push('http://localhost:8989') // JS bundle
    helmetConfig.contentSecurityPolicy.directives.connectSrc.push('http://localhost:54711') // nREPL
    helmetConfig.contentSecurityPolicy.directives.connectSrc.push('ws://localhost:9630') // nREPL
    helmetConfig.contentSecurityPolicy.directives.scriptSrc.push("'unsafe-eval'")
    helmetConfig.contentSecurityPolicy.directives.styleSrc.push("'unsafe-inline'")
  }

  return helmetConfig
}

export default () => {
  Meteor.startup(() => {
    // Apparently the SRI hash of modules.js is incorrect in
    // if (WebAppInternals.enableSubresourceIntegrity) {
    //   WebAppInternals.enableSubresourceIntegrity()
    // }

    WebAppInternals.setInlineScriptsAllowed(false)

    WebApp.connectHandlers.use((req, res, next) => {
      const nonce = Buffer.from(uuidv4()).toString('base64')

      // A node req object has many more keys than meteor's request,
      // HACK: Attach the nonce to the request url as search fragment
      // so that it survives the transformation from req to request.
      // Servers never receive url fragments from clients.
      req.url = req.url + '#' + nonce

      // Also attach the same nonce to the req object to build the csp
      req.nonce = nonce

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
      const nonce = request.url.hash.substr(1)
      const primaryColor = Settings.get('primaryColor')

      let head = ''

      head += '\n  <title>Connecting…</title>'
      head += `\n  <meta property="csp-nonce" content="${nonce}">`


      // Be careful to prevent html injection here
      if (primaryColor && primaryColor.match(/^#[a-fA-F0-9]{1,8}$/)) {
        head += `\n  <meta property="theme-color" content="${primaryColor}">`
        head += `\n  <style nonce="${nonce}">html, body { background-color: ${primaryColor}; }</style>`
      }

      head += '\n  <meta name="robots" content="noindex, nofollow">'
      head += '\n  <meta name="viewport" content="user-scalable=no, width=device-width, maximum-scale=1, initial-scale=1, minimum-scale=1">'


      // Prepend
      data.head = head + '\n' + data.head
      data.body += '\n  <noscript>Please enable JavaScript.</noscript>'

      // WIP: shadow-cljs
      if (process.env.NODE_ENV === 'development') {
        // data.body += `\n  <script type="text/javascript" nonce="${nonce}" src="http://localhost:8989/cljs-index.js"></script>`
        data.body += `\n  <script type="text/javascript" nonce="${nonce}" src="http://localhost:8989/main.js"></script>`
      }

      return true
    })
  })
}
