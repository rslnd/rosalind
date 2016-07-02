import 'client/index.html'
import config from './config'
import native from './native'
import routes from './routes'
import afterStartup from './afterStartup'

export default function () {
  routes()
  config()
  native()
  afterStartup()
}
