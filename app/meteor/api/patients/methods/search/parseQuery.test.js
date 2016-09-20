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

      it('parses names', function () {
        expect(parseQuery('walrus unicorn i')).to.eql({
          $or: [
            { 'profile.lastName': 'walrus' },
            { 'profile.lastName': 'unicorn' }
          ]
        })
      })

    })
  })
})
