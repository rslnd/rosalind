/* eslint-env mocha */
import { expect } from 'chai'
import { fuzzyMonth, fuzzyBirthday } from './fuzzyBirthday'

describe('util', function () {
  describe('fuzzy', function () {
    describe('fuzzyBirthday', function () {
      const parsed = {
        day: 12,
        month: 6,
        year: 1994
      }

      it('parses DD.MM.YYYY', function () {
        expect(fuzzyBirthday('12.06.1994')).to.eql(parsed)
      })

      it('parses DDMMYYYY', function () {
        expect(fuzzyBirthday('12061994')).to.eql(parsed)
      })

      it('parses DDMMYY', function () {
        expect(fuzzyBirthday('120694')).to.eql(parsed)
      })

      it('parses DDMMMMYY', function () {
        expect(fuzzyBirthday('12jun94')).to.eql(parsed)
      })

      it('parses DDMMMMYYYY', function () {
        expect(fuzzyBirthday('12jun1994')).to.eql(parsed)
      })

      it('parses DD-MMMM-YYYY', function () {
        expect(fuzzyBirthday('12-jun-1994')).to.eql(parsed)
      })

      it('parses DD.junYYYY', function () {
        expect(fuzzyBirthday('12.jun1994')).to.eql(parsed)
      })

      it('parses DD. M. YY', function () {
        expect(fuzzyBirthday('12. 6. 94')).to.eql(parsed)
      })

      it('parses DD-m-YY', function () {
        expect(fuzzyBirthday('12-6-94')).to.eql(parsed)
      })

      it('returns result', function () {
        expect(fuzzyBirthday('12.06.1994 hello hello')).to.eql({ ...parsed, note: 'hello hello' })
        expect(fuzzyBirthday('unicorn walrus 12.06.1994')).to.eql(parsed)
      })

      it('returns no result if not parseable', function () {
        expect(fuzzyBirthday('hello hello')).to.eql(false)
      })

      it('parses DD MM YYYY', function () {
        expect(fuzzyBirthday('12 06 1994')).to.eql(parsed)
      })

      it('parses DD MM YY', function () {
        expect(fuzzyBirthday('12 06 94')).to.eql(parsed)
      })

      it('parses and zero-fixes', function () {
        expect(fuzzyBirthday('12o694')).to.eql(parsed)
        expect(fuzzyBirthday('12. O6. 1994')).to.eql(parsed)
        expect(fuzzyBirthday('12.o6.1994')).to.eql(parsed)
        expect(fuzzyBirthday('1o.1O.199o')).to.eql({
          day: 10,
          month: 10,
          year: 1990
        })
      })

      it('parses DD MM 00', function () {
        expect(fuzzyBirthday('12 06 00')).to.eql({
          day: 12,
          month: 6,
          year: 2000
        })
      })

      it('parses DD MM 12', function () {
        expect(fuzzyBirthday('12 06 12')).to.eql({
          day: 12,
          month: 6,
          year: 2012
        })
      })

      it('skips incomplete date', function () {
        expect(fuzzyBirthday('june')).to.eql(false)
      })

      it('skips invalid day', function () {
        expect(fuzzyBirthday('66.12.1994')).to.eql(false)
      })

      it('parses DD Jun YY', function () {
        expect(fuzzyBirthday('12 jun 12')).to.eql({
          day: 12,
          month: 6,
          year: 2012
        })
      })
      it('parses DD Juni YY', function () {
        expect(fuzzyBirthday('12 juni 12')).to.eql({
          day: 12,
          month: 6,
          year: 2012
        })
      })

      it('parses DD Januar YY', function () {
        expect(fuzzyBirthday('12 Januar 12')).to.eql({
          day: 12,
          month: 1,
          year: 2012
        })
      })

      it('parses DD Feb YY', function () {
        expect(fuzzyBirthday('12 Feb 12')).to.eql({
          day: 12,
          month: 2,
          year: 2012
        })
      })

      it('parses DD 02 YY', function () {
        expect(fuzzyBirthday('12 02 12')).to.eql({
          day: 12,
          month: 2,
          year: 2012
        })
      })

      it('parses other non-numeric months', function () {
        expect(fuzzyMonth('jan')).to.eql(1)
        expect(fuzzyMonth('jänner')).to.eql(1)
        expect(fuzzyMonth('januar')).to.eql(1)

        expect(fuzzyMonth('febr')).to.eql(2)
        expect(fuzzyMonth('feber')).to.eql(2)
        expect(fuzzyMonth('Feb')).to.eql(2)

        expect(fuzzyMonth('März')).to.eql(3)
        expect(fuzzyMonth('mar')).to.eql(3)
        expect(fuzzyMonth('mrz')).to.eql(3)

        expect(fuzzyMonth('Apr')).to.eql(4)
        expect(fuzzyMonth('april')).to.eql(4)

        expect(fuzzyMonth('mai')).to.eql(5)
        expect(fuzzyMonth('Mai')).to.eql(5)

        expect(fuzzyMonth('Juni')).to.eql(6)
        expect(fuzzyMonth('Jun')).to.eql(6)
        expect(fuzzyMonth('june')).to.eql(6)

        expect(fuzzyMonth('jul')).to.eql(7)
        expect(fuzzyMonth('juli')).to.eql(7)
        expect(fuzzyMonth('Juli')).to.eql(7)

        expect(fuzzyMonth('aug')).to.eql(8)
        expect(fuzzyMonth('August')).to.eql(8)

        expect(fuzzyMonth('Sept')).to.eql(9)
        expect(fuzzyMonth('9')).to.eql(9)

        expect(fuzzyMonth('Oktober')).to.eql(10)
        expect(fuzzyMonth('okt')).to.eql(10)
        expect(fuzzyMonth('oct')).to.eql(10)

        expect(fuzzyMonth('November')).to.eql(11)
        expect(fuzzyMonth('nov')).to.eql(11)

        expect(fuzzyMonth('Dezember')).to.eql(12)
        expect(fuzzyMonth('dez')).to.eql(12)

        expect(fuzzyMonth('Non')).to.eql(false)
      })
    })
  })
})
