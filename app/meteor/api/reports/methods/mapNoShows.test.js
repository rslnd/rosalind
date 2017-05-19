/* eslint-env mocha */
import { expect } from 'chai'
import { mapNoShows } from './mapNoShows'
import { appointments, messages } from './mapNoShows.fixture.js'

describe('reports', () => {
  describe('mapNoShows', () => {
    it('counts total no-shows', () => {
      expect(mapNoShows({ appointments }).total).to.equal(29)
    })

    it('counts unfilled cancelations', () => {
      expect(mapNoShows({ appointments }).canceled).to.equal(6)
    })

    it('counts reminded but no show', () => {
      expect(mapNoShows({ appointments, messages }).remindedNoShow).to.equal(29)
    })

    it('counts not reminded and no show', () => {
      expect(mapNoShows({ appointments, messages }).notRemindedNoShow).to.equal(0)
    })

  })
})
