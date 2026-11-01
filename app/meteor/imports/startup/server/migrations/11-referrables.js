import { Migrations } from 'meteor/percolate:migrations'
import { Referrals, Referrables } from '../../../api/referrals'

const up = async () => {
  const referrals = await Referrals.find({}).fetchAsync()
  const referrables = await Referrables.find({}).fetchAsync()

  for (const r of referrals) {
    const referrableId = referrables.find(b =>
      r.referredTo === b.toCalendarId ||
      r.referredTo === b.toTagId
    )._id

    if (!referrableId) {
      console.error(r)
      throw new Error('Unknown referrableId')
    }

    await Referrals.updateAsync({ _id: r._id }, {
      $set: {
        referrableId
      }
    })
  }

  return true
}

const down = async () => {
  await Referrals.updateAsync({}, {
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
