import logging from './logging'
import worker from './worker'

export default function () {
  logging()
  worker()
}
