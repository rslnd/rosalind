/* eslint-env mocha */
import chai from 'chai'
import { translateAssigneeIds } from './translateAssigneeIds'

const expect = chai.expect

describe('api', function () {
  describe('reports', function () {
    describe('eoswin translateAssigneeIds', function () {
      const mapping = {
        'A1': 'aaa',
        'A2': 'bbb'
      }

      const mapIds = k => mapping[k]

      const report = {
        A1: 1,
        A2: { ok: 'cool' }
      }

      const unmappedKeysReport = {
        A1: 1,
        A10: 'nope'
      }

      it('translates report keys', () => {
        expect(translateAssigneeIds(mapIds)(report)).to.eql({
          aaa: 1,
          bbb: { ok: 'cool' }
        })
      })

      it('fails when report key is unmapped', () => {
        expect(() => translateAssigneeIds(mapIds)(unmappedKeysReport)).to.throw()
      })

      it('does not fail if assignee has type field', () => {
        expect(() => translateAssigneeIds(mapIds)({
          ...report,
          A12: { type: 'external' }
        })).to.not.throw()
      })

      it('merges different assignee types', () => {
        expect(translateAssigneeIds(mapIds)({
          ...report,
          A12: { type: 'external' }
        })).to.eql({
          aaa: 1,
          bbb: { ok: 'cool' },
          external: { type: 'external' }
        })
      })

      it('removed assigneeId field if assignee has a type field', () => {
        expect(translateAssigneeIds(mapIds)({
          ...report,
          A12: { type: 'external', assigneeId: 'A13' }
        })).to.eql({
          aaa: 1,
          bbb: { ok: 'cool' },
          external: { type: 'external' }
        })
      })
    })
  })
})
