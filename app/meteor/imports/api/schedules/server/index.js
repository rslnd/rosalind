import jobs from './jobs'
import methods from './methods'
import publication from './publication'
import security from './security'
import tables from '../tables'

export default function() {
  jobs()
  methods()
  publication()
  security()
}
