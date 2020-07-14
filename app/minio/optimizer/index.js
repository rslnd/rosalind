const Minio = require('minio')
const mqtt = require('mqtt')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')

const main = async () => {
  const config = getConfig()
  console.log('Connecting to minio')
  const minioClient = await getMinioClient({ config })
  console.log('Connecting to mqtt')
  const mqttClient = await getMqttClient({ config })

  mqttClient.on('message', (topic, message) => {
    const notification = JSON.parse(message.toString())
    handleBucketNotification({
      config,
      minioClient,
      notification
    })
  })

  console.log('Setting up bucket notification')
  await ensureNotifications({ config, minioClient })

  // TODO: convert and upload pending items in TMP_DIR
  console.log('Ready')
}

const getConfig = () => {
  const vars = [
    'MINIO_HOST',
    'MINIO_ACCESS_KEY',
    'MINIO_SECRET_KEY',
    'MINIO_REGION',
    'SOURCE_BUCKET',
    'TARGET_BUCKET',
    'MQTT_BROKER',
    'MQTT_TOPIC'
  ]

  const extraConfig = {
    TMP_DIR: fs.mkdtempSync('/tmp/optimizer')
  }

  const missing = vars.filter(x => !process.env[x])
  if (missing.length >= 1) {
    throw new Error(`Missing env variables: ${missing.join(', ')}`)
  }

  const config = {
    ...vars.reduce((acc, v) => ({ ...acc, [v]: process.env[v] }), {}),
    ...extraConfig
  }

  return config
}

const getMinioClient = ({ config }) =>
  new Minio.Client({
    endPoint: config.MINIO_HOST,
    port: config.MINIO_PORT || 9000,
    useSSL: false,
    accessKey: config.MINIO_ACCESS_KEY,
    secretKey: config.MINIO_SECRET_KEY
  })

const getMqttClient = ({ config }) =>
  new Promise((resolve, reject) => {
    console.log('Connecting to broker', config.MQTT_BROKER)
    const client = mqtt.connect(config.MQTT_BROKER)
    client.on('connect', () => {
      console.log('Connected to broker, subscribing to topic', config.MQTT_TOPIC)
      client.subscribe(config.MQTT_TOPIC, {}, (err) => {
        if (err) { return reject(err) }
        console.log('MQTT client ready')
        resolve(client)
      })
    })
  })

const ensureNotifications = ({ config, minioClient }) => {
  const bucketNotification = new Minio.NotificationConfig()
  const arn = Minio.buildARN(
    'minio',
    'sqs',
    config.MINIO_REGION,
    '1',
    'mqtt'
  )

  console.log('ARN', arn.toString())

  const queue = new Minio.QueueConfig(arn)
  queue.addEvent(Minio.ObjectCreatedAll)
  bucketNotification.add(queue)

  return minioClient.setBucketNotification(config.SOURCE_BUCKET, bucketNotification)
}

const retry = async (fn) => {
  const start = new Date()
  const tryUntil = start + (1000 * 60)
  let tries = 5

  do {
    try {
      const result = await fn()
      const end = new Date()
      console.log('took', end - start, 'ms')
      return result
    } catch (e) {
      console.log('failed, retrying', tries, 'more times after delay, error was', e)
      await delay(1000)
      tries--
    }
  } while (tries > 0 || (new Date()) < tryUntil)

  throw new Error(`Giving up ${logTag}`)
}

const handleBucketNotification = async ({ notification, minioClient, config }) => {
  retry(async () => {

    const key = notification.Records[0].s3.object.key
    const bucketName = notification.Records[0].s3.bucket.name

    if (bucketName !== config.SOURCE_BUCKET) {
      console.log('Ignoring event for bucket', bucketName, 'as it is not the same as SOURCE_BUCKET:', config.SOURCE_BUCKET)
      return
    }

    const localPath = await downloadItem({ minioClient, config, key })
    await optimize({ localPath })
    await uploadItem({ minioClient, config, localPath, key })
    fs.unlink(localPath, () => {})
    await minioClient.removeObject(config.SOURCE_BUCKET, key)
  })
}

const downloadItem = async ({ minioClient, config, key }) => {
  console.log('Downloading file', key)
  const localPath = path.join(config.TMP_DIR, key)
  await minioClient.fGetObject(config.SOURCE_BUCKET, key, localPath)
  console.log('Downloaded to', localPath)
  return localPath
}

const optimize = async ({ localPath }) => {
  console.log('Optimizing with exiftran')
  await runCommand(['exiftran', '-ai', localPath])
  console.log('Optimizing with jpegoptim')
  await runCommand(['jpegoptim', '--strip-all', '--all-progressive', '--preserve', '--max=85', localPath])
}

const runCommand = (cmd) =>
  new Promise((resolve, reject) => {
    exec(cmd.join(' '), (error, stdout, stderr) => {
      if (error) {
        console.error(error)
        reject(error)
      }
      console.log(stdout)
      console.log(stderr)
      resolve()
    })
  })

const uploadItem = async ({ minioClient, config, localPath, key }) => {
  console.log('Uploading file', localPath)
  await minioClient.fPutObject(config.TARGET_BUCKET, key, localPath, {})
  console.log('Uploaded as', key)
  return true
}

setTimeout(async () => {
  try {
    await main()
  } catch (e) {
    console.error('Optimizer failed to start')
    console.error(e)
    process.exit(1)
  }
}, 5000)
