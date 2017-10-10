/* eslint-env mocha */
import moment from 'moment'
import { expect } from 'chai'
import { daysForPreview } from './daysForPreview'

describe('reports', () => {
  describe('daysForPreview', () => {
    it('previews twelve days', () => {
      const date = moment('2017-10-19')
      expect(daysForPreview(date)).to.have.lengthOf(18)
      expect(daysForPreview(date, 2)).to.have.lengthOf(12)
    })
  })
})
