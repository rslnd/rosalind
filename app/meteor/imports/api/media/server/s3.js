import { URL } from 'url'
import { sign } from 'aws4'
import { Settings } from '../../settings'

export const getCredentials = () => {
  const bucketUploads = process.env.MEDIA_S3_BUCKET_UPLOADS || Settings.get('media.s3.bucketUploads')
  const bucketDownloads = process.env.MEDIA_S3_BUCKET_DOWNLOADS || Settings.get('media.s3.bucketDownloads')
  const region = process.env.MEDIA_S3_REGION || Settings.get('media.s3.region')
  const host = process.env.MEDIA_S3_HOST || Settings.get('media.s3.host')
  const accessKeyId = process.env.MEDIA_S3_ACCESS_KEY_ID || Settings.get('media.s3.accessKey')
  const secretAccessKey = process.env.MEDIA_S3_SECRET_ACCESS_KEY || Settings.get('media.s3.secretAccessKey')
  const scheme = process.env.NODE_ENV === 'development' ? 'http' : 'https'

  const credentials = { bucketUploads, bucketDownloads, region, host, accessKeyId, secretAccessKey, scheme }

  const missing = Object.keys(credentials).filter(k => !credentials[k])
  if (missing.length >= 1) {
    throw new Error(`Missing media credentials settings for ${missing.join(', ')}`)
  }

  return credentials
}

export const createPresignedRequest = ({ credentials, filename, ...properties }) => {
  const { region, host, accessKeyId, secretAccessKey, scheme } = credentials
  const bucket = properties.method === 'PUT' ? credentials.bucketUploads : credentials.bucketDownloads
  const path = '/' + bucket + '/' + filename
  const url = scheme + '://' + host + path
  const signed = sign({
    service: 's3',
    region,
    url,
    path,
    method: 'GET',
    host,
    ...properties
  }, { accessKeyId, secretAccessKey })

  return signed
}

export const requestToUrl = request => {
  const url = new URL(request.url)
  return url.origin + request.path
}
