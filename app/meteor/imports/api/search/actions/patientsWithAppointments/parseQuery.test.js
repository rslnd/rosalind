/* eslint-env mocha */
import { expect } from 'chai'
import { parseQuery } from './parseQuery'

describe('patients', function () {
  describe('find', function () {
    describe('parseQuery', function () {
      it('skips empty query', function () {
        expect(parseQuery()).to.eql(false)
        expect(parseQuery('')).to.eql(false)
      })

      it('parses birthdays', function () {
        expect(parseQuery('12 jun 94')).to.eql({
          'birthday.day': 12,
          'birthday.month': 6,
          'birthday.year': 1994
        })
      })

      it('parses first name', function () {
        expect(parseQuery('_ Ilse')).to.eql({
          'firstName': { $regex: '^Ilse', $options: 'i' }
        })
      })


      // it('parses names', function () {
      //   expect(parseQuery('walrus unicorn i')).to.eql({
      //     $or: [
      //       { 'lastNameNormalized': 'WALRUSUNICORNI' },
      //       { 'lastNameNormalized': 'WALRUS' },
      //       { 'lastNameNormalized': 'UNICORN' },
      //       { 'lastNameNormalized': 'I' }
      //     ],
      //     'firstName': {
      //       $regex: '^i',
      //       $options: 'i'
      //     }
      //   })
      // })

      // it('removes umlauts', function () {
      //   expect(parseQuery('walrüs unicörn')).to.eql({
      //     $or: [
      //       { 'lastNameNormalized': 'WALRSUNICRN' },
      //       { 'lastNameNormalized': 'WALRS' },
      //       { 'lastNameNormalized': 'UNICRN' }
      //     ],
      //     'firstName': {
      //       $regex: '^unicörn',
      //       $options: 'i'
      //     }
      //   })
      // })

      // it('parses birthday and names', function () {
      //   expect(parseQuery('walrus unicorn 12 jun 1994')).to.eql({
      //     'birthday.day': 12,
      //     'birthday.month': 6,
      //     'birthday.year': 1994,
      //     $or: [
      //       { 'lastNameNormalized': 'WALRUSUNICORN' },
      //       { 'lastNameNormalized': 'WALRUS' },
      //       { 'lastNameNormalized': 'UNICORN' }
      //     ],
      //     'firstName': {
      //       $regex: '^unicorn',
      //       $options: 'i'
      //     }
      //   })
      // })
    })
  })
})
