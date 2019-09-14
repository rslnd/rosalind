import { URL } from 'url'
import { sign } from 'aws4'
import { Settings } from '../../settings'

export const getCredentials = () => {
  const bucket = process.env.MEDIA_S3_BUCKET || Settings.get('media.s3.bucket')
  const region = process.env.MEDIA_S3_REGION || Settings.get('media.s3.region')
  const host = process.env.MEDIA_S3_HOST || Settings.get('media.s3.host')
  const accessKeyId = process.env.MEDIA_S3_ACCESS_KEY_ID || Settings.get('media.s3.accessKey')
  const secretAccessKey = process.env.MEDIA_S3_SECRET_ACCESS_KEY || Settings.get('media.s3.secretAccessKey')
  const scheme = process.env.NODE_ENV === 'development' ? 'http' : 'https'

  if (!bucket || !region || !host || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing settings values for media.s3.*')
  }

  return { bucket, region, host, accessKeyId, secretAccessKey, scheme }
}

export const createPresignedRequest = ({ credentials, filename, ...properties }) => {
  const { bucket, region, host, accessKeyId, secretAccessKey, scheme } = credentials
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
