import { inboundWebhooks } from './inboundWebhooks'
import { processJobs } from './processJobs'
import { ensurePeriodicJob } from './ensurePeriodicJob'
import { publication } from './publication'

export default function () {
  inboundWebhooks()
  ensurePeriodicJob()
  processJobs()
  publication()
}
