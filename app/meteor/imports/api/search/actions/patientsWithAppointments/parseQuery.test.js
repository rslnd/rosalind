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


      it('parses birthdays from one number, yy 94', function () {
        expect(parseQuery('120694')).to.eql({
          'birthday.day': 12,
          'birthday.month': 6,
          'birthday.year': 1994
        })
      })

      it('parses birthdays from one number, yyyy 1994', function () {
        expect(parseQuery('12061994')).to.eql({
          'birthday.day': 12,
          'birthday.month': 6,
          'birthday.year': 1994
        })
      })

      it('parses birthdays from one number, yyyy 2012', function () {
        expect(parseQuery('12062012')).to.eql({
          'birthday.day': 12,
          'birthday.month': 6,
          'birthday.year': 2012
        })
      })

      it('parses birthdays from one number, yyyy 12', function () {
        expect(parseQuery('120612')).to.eql({
          'birthday.day': 12,
          'birthday.month': 6,
          'birthday.year': 2012
        })
      })

      it('parses first name', function () {
        expect(parseQuery('_ Ilse')).to.eql({
          'firstNameNormalized': { $regex: '^ILSE', $options: 'i' }
        })
      })

      it('parses last name', function () {
        expect(parseQuery('Rotter')).to.eql({
          'lastNameNormalized': { $regex: '^ROTTER' }
        })
      })

      it('parses full last name, double with dash', function () {
        expect(parseQuery('rotter-maier').lastNameNormalized).to.eql({
          $regex: '^ROTTER-MAIER'
        })
      })

      it('parses full last name, double no dash', function () {
        expect(parseQuery('rottermaier')).to.eql({
          'lastNameNormalized': { $regex: '^ROTTERMAIER' }
        })
      })

      it('parses full last name, double no dash, with partial first name', function () {
        expect(parseQuery('rottermaier trud').lastNameNormalized).to.eql({
          $regex: '^ROTTERMAIER'
        })

        expect(parseQuery('rottermaier trud')['$or'].find(x => (x.firstNameNormalized && (x.firstNameNormalized.$regex === "^trud")))).to.eql({
          firstNameNormalized: {
            $options: "i",
            $regex: "^trud"
          }
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
