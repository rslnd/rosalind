/* eslint-env mocha */
import chai from 'chai'
import chaiDatetime from 'chai-datetime'
import {
  postprocessJournal
} from './postprocessJournal'

const expect = chai.expect
chai.use(chaiDatetime)

describe('api', function () {
  describe('reports', function () {
    describe('eoswin postprocessJournal', function () {
      const summed = [
        {
          assignee: 'A1',
          total: 10,
          new: 9
        }
      ]

      const expected = {
        assignees: [
          {
            assigneeId: 'A1',
            patients: {
              total: { actual: 10 },
              new: { actual: 9 }
            }
          }
        ]
      }

      it('transforms summed journal to addendum', function () {
        const result = postprocessJournal(summed)
        expect(result).to.eql(expected)
      })
    })
  })
})
