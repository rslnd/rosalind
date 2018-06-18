import { parseResources, upsertPatients, upsertAppointments } from './shared'

export default (job, callback) => {
  job.log('Terminiko: Running')

  const resources = parseResources(job)
  upsertPatients(job, resources)
  upsertAppointments(job, resources)

  job.done()
  callback()
}
