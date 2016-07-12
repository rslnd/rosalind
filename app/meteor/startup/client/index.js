import client from 'client/index.jsx'
import config from './config'
import native from './native'

export default function () {
  client()
  config()
  native()
}
