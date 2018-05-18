import * as Api from '../../api'
import Fiber from 'fibers'

export default () => {
  process.on('warning', e => {
    console.warn('Node Process warning')
    console.warn(e.name)
    console.warn(e.message)
    console.warn(e.stack)
  })

  if (process.env.ENABLE_TRACE) {
    setInterval(() => {
      const { rss, heapTotal, heapUsed } = process.memoryUsage()
      const { fibersCreated, poolSize } = Fiber

      console.log({ rss, heapTotal, heapUsed, fibersCreated, poolSize })
    }, 5000).unref()
  }

  if (process.env.NODE_ENV === 'production') { return }

  global.Api = Api
}
