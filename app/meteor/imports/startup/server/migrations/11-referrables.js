import { Migrations } from 'meteor/percolate:migrations'
import { Referrals, Referrables } from '../../../api/referrals'

const up = () => {
  const referrals = Referrals.find({}).fetch()
  const referrables = Referrables.find({}).fetch()

  referrals.forEach(r => {
    const referrableId = referrables.find(b =>
      r.referredTo === b.toCalendarId ||
      r.referredTo === b.toTagId
    )._id

    if (!referrableId) {
      console.error(r)
      throw new Error('Unknown referrableId')
    }

    Referrals.update({ _id: r._id }, {
      $set: {
        referrableId
      }
    })
  })

  return true
}

const down = () => {
  Referrals.update({}, {
    $unset: {
      referrableId: 1
    }
  }, { multi: true })

  return true
}

Migrations.add({
  version: 11,
  up,
  down
})
