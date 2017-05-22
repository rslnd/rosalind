/* eslint-env mocha */
import { expect } from 'chai'
import { mapNoShows } from './mapNoShows'
import { appointments, messages } from './mapNoShows.fixture.js'

describe('reports', () => {
  describe('mapNoShows', () => {
    it('counts total no-shows', () => {
      expect(mapNoShows({ appointments }).noShows).to.equal(28)
    })
  })
})
