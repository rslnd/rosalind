import jobs from './jobs'
import methods from './methods'
import publication from './publication'
import publications from './publications'
import security from './security'
import '../tables'

export default function () {
  jobs()
  methods()
  publication()
  publications()
  security()
}
