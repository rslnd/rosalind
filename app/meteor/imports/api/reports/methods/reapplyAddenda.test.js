/* eslint-env mocha */
import { expect } from 'chai'
import { reapplyAddenda } from './reapplyAddenda'

describe('reports', () => {
  describe('reapplyAddenda', () => {
    const day = { day: 1, month: 1, year: 2017 }
    const original = {
      day,
      assignees: {}
    }

    const newReport = {
      day,
      assignees: {
        A1: {
          ok: 'cool'
        }
      }
    }

    const addendum = {
      day,
      A1: {
        ok: 'cool'
      }
    }

    const expected = {
      day,
      assignees: {
        A1: { ok: 'cool' }
      },
      addenda: [
        { ...addendum }
      ]
    }

    it('applies one', () => {
      expect(reapplyAddenda(original)(newReport)(addendum)).to.eql(expected)
    })

    it('reapplies mulitple', () => {
      expect(reapplyAddenda(expected)(expected)(addendum)).to.eql({ ...expected, addenda: [ ...expected.addenda, addendum, addendum ] })
    })
  })
})
