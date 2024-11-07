import identity from 'lodash/identity'
import { URL } from 'url'
import { sign } from 'aws4'
import { Settings } from '../../settings'

const requiredKeys = [
  'bucketUploads',
  'bucketDownloads',
  'region',
  'host',
  'accessKeyId',
  'secretAccessKey',
  'scheme'
]

export const getCredentials = () => {
  const config = process.env.MEDIA_S3_CONFIG
    ? JSON.parse(process.env.MEDIA_S3_CONFIG)
    : Settings.get('media.s3.config')

  const secrets = process.env.MEDIA_S3_SECRETS
    ? JSON.parse(process.env.MEDIA_S3_SECRETS)
    : Settings.get('media.s3.secrets')

  if (!config || !secrets) {
    return null
  }

  if (config.length !== secrets.length) {
    throw new Error(`There are ${config.length} S3 configs specified, but ${secrets.length} secrets`)
  }

  const scheme = (Settings.get('media.s3.scheme') ||
    (process.env.NODE_ENV === 'development' ? 'http' : 'https')
  )

  const secretConfig = config.map((c, i) => ({
    ...c,
    scheme,
    secretAccessKey: secrets[i]
  }))

  const errors = secretConfig.map(c => {
    const missing = requiredKeys.filter(k => !c[k])
    if (missing.length >= 1) {
      return `S3 config with index ${i} is missing keys: ${missing.join(',')}`
    }
  }).filter(identity)
  if (errors.length >= 1) {
    throw new Error(`Missing media credentials: ${errors.join(', ')}`)
  }

  return secretConfig
}

export const createPresignedRequests = ({ credentials, filename, headers, method = 'GET', signQuery }) => {
  return credentials.map(cred => {
    const { region, host, accessKeyId, secretAccessKey, scheme, bucketUploads, bucketDownloads } = cred
    const bucket = method === 'PUT' ? bucketUploads : bucketDownloads
    const path = '/' + bucket + '/' + filename
    const url = scheme + '://' + host + path
    const signed = sign({
      service: 's3',
      region,
      url,
      path,
      method,
      headers: {...(headers || {})}, // damn mutation
      signQuery,
      host
      // horrible mutability: can't splat properties here as it gets mutated inside the sign call and causes eg headers from previous signs to persist
    }, { accessKeyId, secretAccessKey })

    return signed
  })
}

export const requestToUrl = request => {
  const url = new URL(request.url)
  return url.origin + request.path
}
