const identity = require('lodash/identity')
const crypto = require('crypto')
const https = require('https')
const logger = require('./logger')
const { onNewSettings } = require('./settings')

const pollInterval = 30000
const debug = false

let auerPhoneSettings = null
let apiClient = null
let ipcRenderer = null
let pollTimeoutId = null
let lastSeenCallId = null

const start = ({ ipcReceiver }) => {
  let started = false

  ipcRenderer = ipcReceiver
  onNewSettings((newSettings) => {
    auerPhoneSettings =
      newSettings &&
      newSettings.auerPhone &&
      newSettings.auerPhone.host &&
      newSettings.auerPhone.username &&
      newSettings.auerPhone.password &&
      newSettings.auerPhone

    if (auerPhoneSettings) {
      const options = {
        debug: auerPhoneSettings.debug || debug,
        host: auerPhoneSettings.host,
        port: auerPhoneSettings.port || 443,
        rejectUnauthorized: false, // insecure (ignores self-signed certificate) but okay-ish because of digest access authentication
        username: auerPhoneSettings.username,
        password: auerPhoneSettings.password,
        timeout: auerPhoneSettings.timeout || 30000,
      }

      apiClient = makeClient(options)

      if (!started) {
        poll()
        started = true
      }
    } else {
      apiClient = null
    }
  })
}

const poll = () => {
  if (pollTimeoutId) {
    clearTimeout(pollTimeoutId)
  }
  pollTimeoutId = setTimeout(
    pollPhone,
    ((auerPhoneSettings && auerPhoneSettings.pollInterval) || pollInterval)
  )
  return pollTimeoutId
}

const pollPhone = async () => {
  if (!auerPhoneSettings || !apiClient) {
    return poll()
  }

  try {
    logger.info('[auerPhone] requesting last calls')

    // there are two endpoint provinding call data:
    // the first one, /app_gespr_list is documented and fast but does not provide routing info
    // when there is a new call in this first endpoint, we query the
    // second unofficial /listgespr_state endpoint to augment the call with routing info

    const res = await apiClient.request({
      path: '/app_gespr_list'
    })
    const calls = JSON.parse(res)

    // Call slow unofficial augmentation endpoint only if new calls are present
    if (calls && calls[0] && calls[0].id && calls[0].id !== lastSeenCallId) {
      const res = await apiClient.request({
        path: '/listgespr_state'
      })
      const extra = JSON.parse(res)

      const augmentedCalls = calls.map(call => {
        // Ignore private number calls
        if (!call.extRufNr) {
          return null
        }

        const x = extra.rows.find(r => r.id === call.id)
        if (!x) {
          logger.info(`[auerPhone] Skipping ${call.id} because call cannot be augmented`)
          // will likely be augmented in the next polling cycle
          return null
        }

        const xd = x.data

        const newCall = {
          ...call,
          tnNrRechnung: xd[5],
          tnNameRechnung: xd[6],
          tnNrReal: xd[7],
          tnNameReal: xd[8],
          anschlussNr: xd[9],
          abrgArt: xd[12]
        }

        return newCall
      }).filter(identity)

      lastSeenCallId = augmentedCalls[0].id

      logger.info(`[auerPhone] got last ${augmentedCalls.length} calls, latest id is ${augmentedCalls[0] && augmentedCalls[0].id}`)

      ipcRenderer.send('auerPhone', augmentedCalls)
    }
  } catch (e) {
    logger.error(`[auerPhone] Error occured while polling: ${e} - trying again in next polling cycle`)
  }

  poll()
}

const makeClient = (initialOptions) => {
  let nc = false
  let cookie = null

  const request = (methodPathAndHeaders) => {
    const headers = {
      ...(initialOptions.headers || {}),
      ...(methodPathAndHeaders.headers || {}),
      ...(cookie ? { cookie } : {})
    }

    const options = {
      method: 'GET', // mandatory, used in ha2 calculation
      ...initialOptions,
      ...methodPathAndHeaders,
      headers
    }

    const { debug, username, password, ...requestOptions } = options

    debug && console.log('request headers', headers)

    return new Promise((resolve, reject) => {
      debug && console.log('starting request', requestOptions)
      const req = https.request(requestOptions, (res) => {
        debug && console.log('status', res.statusCode)
        debug && console.log('response headers', res.headers)

        res.on('error', reject)
        res.on('abort', reject)
        res.on('timeout', reject)

        // Not handled
        res.on('upgrade', reject)
        res.on('continue', (e) => logger.info(`[auerPhone] http continue ${e}`))
        res.on('information', (e) => logger.info(`[auerPhone] http information ${e}`))
        res.on('response', (e) => logger.info(`[auerPhone] http response ${e}`))
        res.on('socket', (e) => logger.info(`[auerPhone] http socket ${e}`))

        if (res.statusCode === 200) {
          cookie = (res.headers['set-cookie'] || cookie)

          let data = ''
          res.on('data', c => data += c)
          res.on('end', () => resolve(data))
        } else if (res.statusCode === 401 && res.headers['www-authenticate']) {
          const { authorization, newNc } = authorizationHeader({
            debug,
            options,
            nc,
            wwwAuthenticate: res.headers['www-authenticate']
          })

          nc = newNc

          return request({ ...requestOptions, headers: { authorization } })
            .then(resolve)
            .catch(reject)
        } else {
          reject(new Error(`[auerPhone] Unexpected http status code ${res.statusCode}`))
        }
      })

      setTimeout(() => {
        reject(new Error('Manual timeout'))
        req.destroy()
      }, 30000)

      req.end()
    })
  }

  return { request }
}

const parseChallenge = (wwwAuthenticate) => {
  const prefix = 'Digest '
  const challenge = wwwAuthenticate.substr(wwwAuthenticate.indexOf(prefix) + prefix.length)
  const parts = challenge.split(',')
  const length = parts.length
  const params = {}
  for (let i = 0; i < length; i++) {
    const part = parts[i].match(/^\s*?([a-zA-Z0-0]+)="(.*)"\s*?$/)
    if (part.length > 2) {
      params[part[1]] = part[2]
    }
  }
  return params
}

const authorizationHeader = ({ debug, wwwAuthenticate, options, nc }) => {
  const challenge = parseChallenge(wwwAuthenticate)
  debug && console.log('challenge', challenge)

  const ha1 = crypto.createHash('md5')
  ha1.update([options.username, challenge.realm, options.password].join(':'))
  const ha2 = crypto.createHash('md5')
  ha2.update([options.method, options.path].join(':'))

  // Generate cnonce
  let cnonce = false
  if (typeof challenge.qop === 'string') {
    const cnonceHash = crypto.createHash('md5')
    cnonceHash.update(Math.random().toString(36))
    cnonce = cnonceHash.digest('hex').substr(0, 8)

    const max = 99999999
    nc++;
    if (nc > max) {
      nc = 1;
    }
    const padding = new Array(8).join('0') + ''
    nc = padding.substr(0, 8 - nc.length) + (nc + '')
  }

  // Generate response hash
  const response = crypto.createHash('md5')
  var responseParams = [
    ha1.digest('hex'),
    challenge.nonce
  ]

  if (cnonce) {
    responseParams.push(nc)
    responseParams.push(cnonce)
  }

  responseParams.push(challenge.qop)
  responseParams.push(ha2.digest('hex'))
  response.update(responseParams.join(':'))

  // Setup response parameters
  var authParams = {
    username: options.username,
    realm: challenge.realm,
    nonce: challenge.nonce,
    uri: options.path,
    qop: challenge.qop,
    response: response.digest('hex'),
    opaque: challenge.opaque
  }
  if (cnonce) {
    authParams.nc = nc
    authParams.cnonce = cnonce
  }

  const parts = []
  for (let i in authParams) {
    parts.push(i + '="' + authParams[i] + '"')
  }

  const authorization = 'Digest ' + parts.join(',')

  debug && console.log('authorization', authorization)

  return { newNc: nc, authorization }
}

module.exports = { start }
