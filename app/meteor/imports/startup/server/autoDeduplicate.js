import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import Api from '../../api'
import { isLikelySamePatient } from '../../api/patients/methods/isLikelySamePatient'
import idx from 'idx'
import { deduplicate, perform } from '../../api/patients/methods/deduplicateWithJournal'

const autoDeduplicate = () => {
  console.log('[autoDeduplicate] Starting')
  const startAt = new Date()

  const patients = Api.Patients.find({}, {
    $sort: { _id: 1 }
  }).fetch()

  const suspectedDupes = patients.reduce((acc, p1, i) => {
    // only look at p2-patients starting from the current p1-index to avoid symmetrical duplicates

    if (i % 1000 === 0) {
      console.log('[autoDeduplicate] Processing', i, '/', patients.length, 'patients')
    }

    const sus = Api.Patients.find({
      lastNameNormalized: p1.lastNameNormalized,
      _id: { $gt: p1._id }
    }).fetch().filter(p2 =>
      isLikelySamePatient(p1, p2)
    )

    if (sus.length >= 1) {
      const tuple = [p1, ...sus]
      const master = tuple.find(p =>
        idx(p, _ => _.external.eoswin.id) ||
        idx(p, _ => _.external.inno.id)
      ) || tuple.find(p =>
      (p.insuranceId || (p.birthday && p.birthday.day))) || p1
      const nonmaster = tuple.filter(p => p._id !== master._id)

      return [...acc, [master, ...nonmaster]]
    } else {
      return acc
    }

  }, [])

  suspectedDupes.map(ps => ps.map(p => p._id)).map((l, i, all) =>
    console.log('[autoDeduplicate]', i+1, '/', all.length, l)
  )

  console.log('[autoDeduplicate] suspected duplicate tuples', suspectedDupes.length)

  const actions = deduplicate(suspectedDupes)
  const result = perform({ actions, ...Api })

  console.log('[autoDeduplicate] result of deduplicating', result)

  const tookSeconds = ((new Date()) - startAt) / 1000
  console.log('[autoDeduplicate] Finished, took', tookSeconds, 'seconds')
}


if (process.env.PROCESS_JOBS === '1') {
  Meteor.startup(autoDeduplicate)

  const next1AMInMs = moment().add(1, 'day').startOf('day').add(1, 'hour').diff(moment(), 'milliseconds')

  Meteor.setTimeout(() => {
    autoDeduplicate()
    Meteor.setInterval(autoDeduplicate, 1000 * 86400)
  }, next1AMInMs)
}
