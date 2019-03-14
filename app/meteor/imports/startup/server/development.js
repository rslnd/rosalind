import * as Api from '../../api'
import { MongoInternals } from 'meteor/mongo'

export default () => {
  process.on('warning', e => {
    console.warn('[Server] Node process warning')
    console.warn(e.name)
    console.warn(e.message)
    console.warn(e.stack)
  })

  process.on('unhandledRejection', (exception, promise) => {
    console.error('[Server] Node unhandled promise rejection', exception, exception.stack, promise)
  })

  // Fiber.poolSize = 1e9;

  // if (process.env.ENABLE_TRACE || process.env.NODE_ENV === 'development') {
  //   setInterval(() => {
  //     const { rss, heapTotal, heapUsed } = process.memoryUsage()
  //     const { fibersCreated, poolSize } = Fiber

  //     console.log({ rss, heapTotal, heapUsed, fibersCreated, poolSize })
  //   }, 20 * 1000).unref()
  // }

  const Mongo = MongoInternals.defaultRemoteCollectionDriver().mongo
  const db = Mongo.db
  const multiplexers = Mongo._observeMultiplexers

  db.s.topology.on('close', e => {
    console.error('[Debug] Database topology change: closed')
    console.log(`Number of observes are active: ${Object.keys(multiplexers).length}`)
  })

  db.s.topology.on('reconnect', data =>
    console.log('[Debug] Database topology change: Successfully reconnected to mongo'))

  db.s.topology.on('reconnectFailed', data =>
    console.error('[Debug] Database topology change: Failed to reconnect to mongo'))

  db.s.topology.on('left', data =>
    console.log('[Debug] Database topology change: A server left the replica set'))

  db.s.topology.on('joined', data =>
    console.log('[Debug] Database topology change: A server joined the replica set'))

  if (process.env.NODE_ENV === 'production') { return }

  global.Api = Api
}
