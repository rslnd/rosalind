import config from './config'
import helpers from './helpers'
import native from './native'
import routes from './routes'

export default function() {
  helpers()
  routes()
  config()
  native()
}
