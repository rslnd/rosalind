/* eslint-env mocha */
import chai from 'chai'
import chaiDatetime from 'chai-datetime'
import { preprocessRevenue } from './preprocessRevenue'
import { REPORT } from './revenue.fixture'
import { parseCsv } from './processRevenue'

const expect = chai.expect
chai.use(chaiDatetime)

describe('api', function () {
  describe('reports', function () {
    describe('eoswin', function () {
      describe('parseAddendum with fixture', function () {
        it('sums total revenue by assignee', function () {
          const result = preprocessRevenue(parseCsv(REPORT))

          expect(result).to.eql({
            A5: { revenue: 0 },
            A6: { revenue: 2.64 },
            A11: { revenue: 1024.27 },
            A12: { revenue: 36.58 }
          })
        })
      })
    })
  })
})
