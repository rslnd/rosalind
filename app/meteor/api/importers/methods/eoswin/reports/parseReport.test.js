/* eslint-env mocha */
import chai from 'chai'
import chaiDatetime from 'chai-datetime'
import { matchInsuranceCode, parseReportDate, parseReport } from './parseReport'
import { REPORT } from './report.fixture'

const expect = chai.expect
chai.use(chaiDatetime)

describe('importers', function () {
  describe('eoswin', function () {
    describe('eoswinPatients', function () {
      it('knows about insurance codes', function () {
        expect(matchInsuranceCode('blahblah', 'insurance')).to.equal(null)
        expect(matchInsuranceCode('[502] * 42   -> Ordination', 'surgeries')).to.equal(42)
      })

      describe('parseReportDate', function () {
        it('rejects date ranges', function () {
          expect(parseReportDate, 'Ärzte Statistik Umsätze  [ vom 01.01.2016 bis 23.03.2016]   Uhrzeit 1528.csv').to.throw(Error)
        })

        it('rejects invalid file name', function () {
          expect(parseReportDate, 'Ärzte Statistik Umsätze Uhrzeit 1528.csv').to.throw(Error)
        })

        it('parses single date', function () {
          expect(parseReportDate('Ärzte Statistik Umsätze  [ vom 13.08.2016]   Uhrzeit 1314')).to.equalDate(new Date(2016, 7, 13))
        })
      })

      describe('parseReport with fixture', function () {
        const { assignees } = parseReport(REPORT)

        it('contains two assignees', function () {
          expect(assignees.length).to.equal(2)
        })

        it('assignees have ids', function () {
          expect(assignees[0].external.eoswin.id).to.equal('A11')
          expect(assignees[1].external.eoswin.id).to.equal('A12')
        })
      })
    })
  })
})
