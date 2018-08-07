import { publication } from './publication'
import { processJobs } from './processJobs'
import { ensurePeriodicJob } from './ensurePeriodicJob'
import './actions'

export default function () {
  ensurePeriodicJob()
  processJobs()
  publication()
}
