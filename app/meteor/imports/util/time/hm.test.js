
/* eslint-env mocha */
import chai from 'chai'
import chaiDatetime from 'chai-datetime'
import * as hm from './hm'

const expect = chai.expect
chai.use(chaiDatetime)

describe('util', () => {
  describe('hm', () => {
    it('hm to string', () => {
      expect(hm.HMtoString({ h: 11, m: 12 })).to.eql('11:12')
    })

    it('hm to string', () => {
      const d = new Date('Tue Oct 09 2018 11:49:21 GMT+0200 (Central European Summer Time)')
      expect(hm.dateToHM(d)).to.eql({ h: 11, m: 49 })
    })

    it('isWithinHMRange', () => {
      const d = new Date('Tue Oct 09 2018 11:49:21 GMT+0200 (Central European Summer Time)')
      const range = {
        from: { h: 11, m: 0 },
        to: { h: 12, m: 0 }
      }

      expect(hm.isWithinHMRange(range)(d)).to.eql(true)
    })

    it('stringToHMRange', () => {
      const range = {
        from: { h: 10, m: 30 },
        to: { h: 12, m: 0 }
      }
      expect(hm.stringToHMRange('10:30-12:00')).to.eql(range)
    })

    it('stringToHMRange with note', () => {
      const range = {
        from: { h: 10, m: 30 },
        to: { h: 12, m: 0 },
        note: 'Pause'
      }
      expect(hm.stringToHMRange('10:30-12:00 Pause')).to.eql(range)
    })

    it('stringToHMRange with dashed note', () => {
      const range = {
        from: { h: 10, m: 30 },
        to: { h: 12, m: 0 },
        note: 'Pause role-extra-string only now'
      }
      expect(hm.stringToHMRange('10:30-12:00 Pause role-extra-string only now')).to.eql(range)
    })
  })
})
