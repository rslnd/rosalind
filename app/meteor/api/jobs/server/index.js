import logging from './logging'
import publication from './publication'
import worker from './worker'
import table from '../table'

export default function () {
  logging()
  publication()
  worker()
  table()
}
