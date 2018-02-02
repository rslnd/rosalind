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
          'profile.birthday.day': 12,
          'profile.birthday.month': 6,
          'profile.birthday.year': 1994
        })
      })

      // it('parses names', function () {
      //   expect(parseQuery('walrus unicorn i')).to.eql({
      //     $or: [
      //       { 'profile.lastNameNormalized': 'WALRUSUNICORNI' },
      //       { 'profile.lastNameNormalized': 'WALRUS' },
      //       { 'profile.lastNameNormalized': 'UNICORN' },
      //       { 'profile.lastNameNormalized': 'I' }
      //     ],
      //     'profile.firstName': {
      //       $regex: '^i',
      //       $options: 'i'
      //     }
      //   })
      // })

      // it('removes umlauts', function () {
      //   expect(parseQuery('walrüs unicörn')).to.eql({
      //     $or: [
      //       { 'profile.lastNameNormalized': 'WALRSUNICRN' },
      //       { 'profile.lastNameNormalized': 'WALRS' },
      //       { 'profile.lastNameNormalized': 'UNICRN' }
      //     ],
      //     'profile.firstName': {
      //       $regex: '^unicörn',
      //       $options: 'i'
      //     }
      //   })
      // })

      // it('parses birthday and names', function () {
      //   expect(parseQuery('walrus unicorn 12 jun 1994')).to.eql({
      //     'profile.birthday.day': 12,
      //     'profile.birthday.month': 6,
      //     'profile.birthday.year': 1994,
      //     $or: [
      //       { 'profile.lastNameNormalized': 'WALRUSUNICORN' },
      //       { 'profile.lastNameNormalized': 'WALRUS' },
      //       { 'profile.lastNameNormalized': 'UNICORN' }
      //     ],
      //     'profile.firstName': {
      //       $regex: '^unicorn',
      //       $options: 'i'
      //     }
      //   })
      // })
    })
  })
})
