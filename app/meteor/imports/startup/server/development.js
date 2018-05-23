import * as Api from '../../api'
import Fiber from 'fibers'

export default () => {
  process.on('warning', e => {
    console.warn('Node Process warning')
    console.warn(e.name)
    console.warn(e.message)
    console.warn(e.stack)
  })

  Fiber.poolSize = 1e9;

  if (process.env.ENABLE_TRACE || process.env.NODE_ENV === 'development') {
    setInterval(() => {
      const { rss, heapTotal, heapUsed } = process.memoryUsage()
      const { fibersCreated, poolSize } = Fiber

      console.log({ rss, heapTotal, heapUsed, fibersCreated, poolSize })
    }, 20 * 1000).unref()
  }

  if (process.env.NODE_ENV === 'production') { return }

  global.Api = Api
}
