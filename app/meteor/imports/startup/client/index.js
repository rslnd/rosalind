import config from './config'
import helpers from './helpers'
import routes from './routes'

export default function() {
  helpers()
  routes()
  config()
}
