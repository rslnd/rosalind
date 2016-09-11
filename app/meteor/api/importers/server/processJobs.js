import { Job } from 'meteor/vsivsi:job-collection'
import terminiko from './terminiko'
import { eoswinPatients } from './eoswin'

export default () => {
  Job.processJobs('import', 'terminiko', terminiko)
  Job.processJobs('import', 'eoswinPatients', eoswinPatients)
}
