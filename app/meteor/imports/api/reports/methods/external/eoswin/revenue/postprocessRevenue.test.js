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
        A5: 0,
        A11: 1024.27
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
