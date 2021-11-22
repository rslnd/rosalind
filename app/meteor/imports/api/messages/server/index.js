import { inboundWebhooks } from './inboundWebhooks'
import { processJobs } from './processJobs'
import { ensurePeriodicJob } from './ensurePeriodicJob'
import { publication } from './publication'
import { sendCustomSms } from './sendCustomSms'
import { getStats } from './getStats'

export default function () {
  inboundWebhooks()
  ensurePeriodicJob()
  processJobs()
  publication()
  sendCustomSms()
  getStats()
}
