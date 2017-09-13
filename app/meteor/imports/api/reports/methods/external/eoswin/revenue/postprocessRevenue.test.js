/* eslint-env mocha */
import chai from 'chai'
import chaiDatetime from 'chai-datetime'
import {
  postprocessRevenue
} from './postprocessRevenue'

const expect = chai.expect
chai.use(chaiDatetime)

describe('api', function () {
  describe('reports', function () {
    describe('eoswin postprocessRevenue', function () {
      const summed = {
        A5: { revenue: 0 },
        A11: { revenue: 1024.27 },
        A12: { revenue: 100.00, type: 'external' }
      }

      const expected = {
        assignees: [
          {
            assigneeId: 'A5',
            revenue: {
              total: {
                actual: 0
              }
            }
          },
          {
            assigneeId: 'A11',
            revenue: {
              total: {
                actual: 1024.27
              }
            }
          },
          {
            type: 'external',
            revenue: {
              total: {
                actual: 100.00
              }
            }
          }
        ]
      }

      it('transforms summed Revenue to addendum', function () {
        const result = postprocessRevenue(summed)
        expect(result).to.eql(expected)
      })
    })
  })
})
