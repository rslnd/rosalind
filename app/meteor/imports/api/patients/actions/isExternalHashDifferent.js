import { action } from '../../../util/meteor/action'
import { Events } from '../../events'

// Filters a given list of hashes and returns only those hashes that do not match any patient
export const isExternalHashDifferent = ({ Patients }) =>
  action({
    name: 'patients/isExternalHashDifferent',
    allowAnonymous: true,
    requireClientKey: true,
    simulation: false,
    args: {
      externalHashes: [String],
      externalProvider: 'inno',
      clientKey: String
    },
    fn ({ externalHashes, externalProvider }) {
      Events.post('patients/isExternalHashDifferent')
      console.log(`[Patients] isExternalHashDifferent: processing ${externalHashes.length} external hashes`)
      const startAt = new Date()

      const field = `external.${externalProvider}.hash`
      const upToDatePatients = Patients.find({
        [field]:{ $in: externalHashes }
      }, { fields: {
        [field]: 1
      }}).fetch().map(p => p.external[externalProvider].hash)

      let upToDatePatientsHashmap = {}
      upToDatePatients.forEach(h => {
        upToDatePatientsHashmap[h] = true
      })

      const differentExternalHashes = externalHashes.filter(h => !upToDatePatientsHashmap[h])

      console.log(`[Patients] isExternalHashDifferent: processing ${externalHashes.length} external hashes to get ${differentExternalHashes.length} different hashes took ${(new Date() - startAt) / 1000} seconds`)

      return differentExternalHashes
    }
  })
