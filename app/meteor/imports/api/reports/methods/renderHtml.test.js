/* eslint-env mocha */
import { expect } from 'chai'
import { renderHtml } from './renderHtml'
import { report } from './renderEmail.fixture.js'

describe('reports', () => {
  describe('renderHtml', () => {
    it('renders report as html', () => {
      const rendered = renderHtml({ report })
      expect(rendered).to.include('This is a Report')
    })
  })
})
