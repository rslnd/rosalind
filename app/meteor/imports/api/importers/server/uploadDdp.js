import moment from 'moment-timezone'
import { Roles } from 'meteor/alanning:roles'
import { Job } from 'meteor/simonsimcity:job-collection'
import { Jobs } from '../../jobs'
import { Users } from '../../users'
import { isAllowedImporter } from '../allowedImporters'
import Importers from '../collection'

const onAfterUpload = (fileRef) => {
  console.log('[Import] uploadDdp: Done receiving file', fileRef)

  const user = Users.findOne(fileRef.userId)

  if (!isAllowedImporter(fileRef.meta.importer)) {
    return console.log('[Import] uploadDdp: Importer not allowed:', fileRef.meta.importer)
  }

  if (!user || !Roles.userIsInRole(user, ['admin', 'upload'])) {
    return console.log('[Import] uploadDdp: User not allowed:', fileRef.userId)
  }

  const options = {
    path: fileRef.path,
    userId: fileRef.userId,
    importer: fileRef.meta.importer,
    meta: fileRef.meta
  }

  new Job(Jobs.import, fileRef.meta.importer, options)
    .retry({
      until: moment().add(1, 'hour').toDate(),
      wait: 1000,
      backoff: 'exponential'
    }).save()
}

export default () => {
  Importers.addListener('afterUpload', onAfterUpload)
}
