/* eslint-env mocha */
import chai from 'chai'
import chaiDatetime from 'chai-datetime'
import { getTagBilledCount, parseReportDate, parseAddendum } from './parseAddendum'
import { REPORT } from './report.fixture'

const expect = chai.expect
chai.use(chaiDatetime)

describe('api', function () {
  describe('reports', function () {
    describe('eoswin', function () {
      it('parses how often a given tag was billed', function () {
        expect(getTagBilledCount('blahblah', 'insurance')).to.equal(null)
        expect(getTagBilledCount('[502] * 42   -> Ordination', 'surgery')).to.equal(42)
      })

      describe('parseReportDate', function () {
        it('rejects date ranges', function () {
          expect(parseReportDate, 'Ärzte Statistik Umsätze  [ vom 01.01.2016 bis 23.03.2016]   Uhrzeit 1528.csv').to.throw(Error)
        })

        it('rejects invalid file name', function () {
          expect(parseReportDate, 'Ärzte Statistik Umsätze Uhrzeit 1528.csv').to.throw(Error)
        })

        it('parses single date', function () {
          expect(parseReportDate('20170906')).to.equalDate(new Date(2017, 8, 6))
        })
      })

      describe('parseAddendum with fixture', function () {
        const { assignees } = parseAddendum({ content: REPORT })

        it('contains two assignees', function () {
          expect(assignees.length).to.equal(2)
        })
      })
    })
  })
})
