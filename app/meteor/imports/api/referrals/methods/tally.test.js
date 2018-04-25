/* eslint-env mocha */
import { expect } from 'chai'
import { tally } from './tally'

const referrals = [
  {
    patientId: 'B2TTNxxmLPBDpmZRN',
    referredTo: 'suX7qs3DjEjooBwZP',
    referredBy: '5a9NQhmscSy8xSf2v',
    createdAt: new Date(),
    redeemedAt: new Date()
  },
  {
    patientId: 'B2TTNxxmLPBDpmZRN',
    referredTo: 'suX7qs3DjEjooBwZP',
    referredBy: '5a9NQhmscSy8xSf2v',
    createdAt: new Date(),
    redeemedAt: new Date()
  }
]

describe('referrals', () => {
  describe('tally', () => {
    it('groups by referredBy', () => {
      const result = tally({
        date: new Date(),
        referrals
      })

      expect(result.assignees).to.have.lengthOf(1)
      expect(result.total.redeemed.ids.suX7qs3DjEjooBwZP).to.eql(2)
    })
  })
})
