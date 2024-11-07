import { Meteor } from 'meteor/meteor'
import identity from 'lodash/identity'
import { WebApp, WebAppInternals } from 'meteor/webapp'
import flatten from 'lodash/flatten'
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

  const scheme = (
    Settings.get('media.s3.scheme') ||
    ((process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') ? 'https://' : 'http://')
  )
  return hosts.filter(identity).map(h => [scheme, h].join(''))
}

const buildCsp = (req, res) => {
  const domain = Meteor.absoluteUrl().replace(/http(s)*:\/\//, '').replace(/\/$/, '')
  const domains = [
    domain,
    ...(process.env.VIRTUAL_HOST ? process.env.VIRTUAL_HOST.split(',') : [])
  ]

  // const reportUri = `https://sentry.io/api/62218/security/?sentry_key=6af65eb19a37410f968d4e602ce572d7&sentry_release=${process.env.COMMIT_HASH}&sentry_environment=${process.env.NODE_ENV}`

  const csp = {
    'connect-src': [
      self,
      ...flatten(domains.map(d =>
        ((Settings.get('media.s3.scheme') === 'http')
        ? [
          `http://${d}`,
          `ws://${d}`
        ] : [
          `https://${d}`,
          `wss://${d}`
        ])
      )),
      ...mediaHosts(),
      // `https://${process.env.SMOOCH_APP_ID}.config.smooch.io/`,
      // 'wss://api.smooch.io',
      // 'https://api.smooch.io',
      // 'https://sentry.io/',
    ],
    'img-src': [
      self,
      'blob:',
      'data:',
      ...mediaHosts(),
      // 'https://app.smooch.io',
      // 'https://cdn.smooch.io',
      // 'https://media.smooch.io',
      // 'https://www.gravatar.com/avatar/9551b5ac12bb6a04fd48d1dcb51f046a.png'
    ],
    'script-src': [
      self,
      `'unsafe-eval'`
      // `'nonce-${req.nonce}'`,
    ],
    'style-src': [
      self,
      // react-select needs a nonce
      `'nonce-${req.nonce}'`,
      // 'https://cdn.smooch.io'
    ],
    'worker-src': [
      self // pdfjs needs a worker
    ],
    'font-src': [
      self,
      // 'https://cdn.smooch.io'
    ],
    'frame-src': [
      // 'https://cdn.smooch.io'
    ],
    'child-src': [
      self
    ],
    'base-uri': [
      none
    ],
    'default-src': [
      none
    ],
    'form-action': [
      self
    ],
    'report-uri': [
      reportUri
    ],
    'frame-ancestors': [
      none
    ],
    'manifest-src': [
      none
    ],
    'media-src': [
      none
    ],
    'object-src': [
      none
    ]
  }

  const extra = [
    'block-all-mixed-content',
    'sandbox allow-same-origin allow-forms allow-scripts allow-modals allow-downloads'
  ]

  if (process.env.NODE_ENV === 'development') {
    csp['connect-src'].push('http://localhost:3000')
    csp['connect-src'].push('ws://localhost:3000')

    // Cannot use nonce and unsafe-inline at the same time. Need unsafe in development.
    csp['style-src'] = csp['style-src'].filter(d => !d.match(/^'nonce-/))
    csp['style-src'].push(["'unsafe-inline'"])

    csp['script-src'] = csp['script-src'].filter(d => !d.match(/^'nonce-/))
    csp['script-src'].push(["'unsafe-inline'"])
    csp['script-src'].push(["'unsafe-eval'"])


    // WIP: shadow-cljs
    // csp['connect-src'].push('http://localhost:54711') // nREPL
    // csp['connect-src'].push('ws://localhost:9630') // nREPL
    // csp['script-src'].push('http://localhost:8989') // JS bundle
  }

  return [
    ...Object.keys(csp).map(k =>
      [k, csp[k].join(' ')].join(' ')
    ),
    ...extra
  ].join('; ')
}

const buildHeaders = (req, res) => {
  return {
    'content-security-policy': buildCsp(req, res),
    'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'expect-ct': 'max-age=604800',
    'pragma': 'no-cache',
    'permissions-policy': "geolocation=(), midi=(), sync-xhr=(), microphone=(), camera=(), magnetometer=(), gyroscope=(), speaker=(), payment=()",
    'referrer-policy': 'no-referrer',
    'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
    'surrogate-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'x-dns-prefetch-control': 'off',
    'x-download-options': 'noopen',
    'x-xss-protection': '1; mode=block',
    'x-frame-options': 'DENY',
    'x-security-reports': 'Please report any issues to security@fxp.at. Thank you <3'
  }
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
      const headers = buildHeaders(req, res)
      Object.keys(headers).forEach(k => {
        res.setHeader(k, headers[k])
      })
      next()
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
      // if (process.env.NODE_ENV === 'development') {
      //   // data.body += `\n  <script type="text/javascript" nonce="${nonce}" src="http://localhost:8989/cljs-index.js"></script>`
      //   data.body += `\n  <script type="text/javascript" nonce="${nonce}" src="http://localhost:8989/main.js"></script>`
      // }

      return true
    })
  })
}
