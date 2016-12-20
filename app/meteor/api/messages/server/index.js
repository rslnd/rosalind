import { processJobs } from './processJobs'
import { ensurePeriodicJob } from './ensurePeriodicJob'

export default function () {
  ensurePeriodicJob()
  processJobs()
}
