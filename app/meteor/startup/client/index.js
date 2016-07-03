import 'client/index.html'
import config from './config'
import native from './native'
import routes from './routes'

export default function () {
  routes()
  config()
  native()
}
