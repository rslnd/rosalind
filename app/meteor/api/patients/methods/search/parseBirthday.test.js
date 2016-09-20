/* eslint-env mocha */
import { expect } from 'chai'
import { parseMonth, parseBirthday } from './parseBirthday'

describe('patients', function () {
  describe('find', function () {
    describe('parseBirthday', function () {
      const parsed = {
        'profile.birthday.day': 12,
        'profile.birthday.month': 6,
        'profile.birthday.year': 1994
      }

      it('parses DD.MM.YYYY', function () {
        expect(parseBirthday('12.06.1994')).to.eql(parsed)
      })

      it('parses DD MM YYYY', function () {
        expect(parseBirthday('12 06 1994')).to.eql(parsed)
      })

      it('parses DD MM YY', function () {
        expect(parseBirthday('12 06 94')).to.eql(parsed)
      })

      it('parses DD MM 00', function () {
        expect(parseBirthday('12 06 00')).to.eql({
          'profile.birthday.day': 12,
          'profile.birthday.month': 6,
          'profile.birthday.year': 2000
        })
      })

      it('parses DD MM 12', function () {
        expect(parseBirthday('12 06 12')).to.eql({
          'profile.birthday.day': 12,
          'profile.birthday.month': 6,
          'profile.birthday.year': 2012
        })
      })

      it('skips incomplete date', function () {
        expect(parseBirthday('june')).to.eql(false)
      })

      it('skips invalid day', function () {
        expect(parseBirthday('66.12.1994')).to.eql({})
      })

      it('parses DD Jun YY', function () {
        expect(parseBirthday('12 jun 12')).to.eql({
          'profile.birthday.day': 12,
          'profile.birthday.month': 6,
          'profile.birthday.year': 2012
        })
      })
      it('parses DD Juni YY', function () {
        expect(parseBirthday('12 juni 12')).to.eql({
          'profile.birthday.day': 12,
          'profile.birthday.month': 6,
          'profile.birthday.year': 2012
        })
      })

      it('parses DD Januar YY', function () {
        expect(parseBirthday('12 Januar 12')).to.eql({
          'profile.birthday.day': 12,
          'profile.birthday.month': 1,
          'profile.birthday.year': 2012
        })
      })

      it('parses DD Feb YY', function () {
        expect(parseBirthday('12 Feb 12')).to.eql({
          'profile.birthday.day': 12,
          'profile.birthday.month': 2,
          'profile.birthday.year': 2012
        })
      })

      it('parses DD 02 YY', function () {
        expect(parseBirthday('12 02 12')).to.eql({
          'profile.birthday.day': 12,
          'profile.birthday.month': 2,
          'profile.birthday.year': 2012
        })
      })

      it('parses other non-numeric months', function () {
        expect(parseMonth('jan')).to.eql(1)
        expect(parseMonth('jänner')).to.eql(1)
        expect(parseMonth('januar')).to.eql(1)

        expect(parseMonth('febr')).to.eql(2)
        expect(parseMonth('feber')).to.eql(2)
        expect(parseMonth('Feb')).to.eql(2)

        expect(parseMonth('März')).to.eql(3)
        expect(parseMonth('mar')).to.eql(3)
        expect(parseMonth('mrz')).to.eql(3)

        expect(parseMonth('Apr')).to.eql(4)
        expect(parseMonth('april')).to.eql(4)

        expect(parseMonth('mai')).to.eql(5)
        expect(parseMonth('Mai')).to.eql(5)

        expect(parseMonth('Juni')).to.eql(6)
        expect(parseMonth('Jun')).to.eql(6)
        expect(parseMonth('june')).to.eql(6)

        expect(parseMonth('jul')).to.eql(7)
        expect(parseMonth('juli')).to.eql(7)
        expect(parseMonth('Juli')).to.eql(7)

        expect(parseMonth('aug')).to.eql(8)
        expect(parseMonth('August')).to.eql(8)

        expect(parseMonth('Sept')).to.eql(9)
        expect(parseMonth('9')).to.eql(9)

        expect(parseMonth('Oktober')).to.eql(10)
        expect(parseMonth('okt')).to.eql(10)
        expect(parseMonth('oct')).to.eql(10)

        expect(parseMonth('November')).to.eql(11)
        expect(parseMonth('nov')).to.eql(11)

        expect(parseMonth('Dezember')).to.eql(12)
        expect(parseMonth('dez')).to.eql(12)

        expect(parseMonth('Non')).to.eql(false)
      })
    })
  })
})
