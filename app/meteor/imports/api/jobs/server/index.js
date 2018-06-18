import logging from './logging'
import security from './security'
import worker from './worker'
import '../table'

export default function () {
  logging()
  security()
  worker()
}
