import { inboundWebhooks } from './inboundWebhooks'
import { processJobs } from './processJobs'
import { ensurePeriodicJob } from './ensurePeriodicJob'

export default function () {
  inboundWebhooks()
  ensurePeriodicJob()
  processJobs()
}
