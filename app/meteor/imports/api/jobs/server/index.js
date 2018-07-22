import logging from './logging'
import worker from './worker'
import '../table'

export default function () {
  logging()
  worker()
}
