/* eslint-env mocha */
import { expect } from 'chai'
import { renderEmail } from './renderEmail'

const statistics = {
  current: {
    from: new Date('2026-07-13T00:00:00'),
    to: new Date('2026-07-13T23:59:59'),
    total: {
      total: 512,
      insurance: 300,
      private: 212,
      noShow: 32,
      noShowRate: 0.062,
      online: 130,
      onlineNoShow: 10,
      onlineNoShowRate: 0.08,
      timeUtilization: 0.72,
      slotUtilization: 0.41
    }
  },
  assignees: [
    {
      assigneeId: 'a1',
      name: 'Dr. A',
      current: { total: 120, noShow: 6, noShowRate: 0.05, timeUtilization: 0.75, online: 20 }
    }
  ]
}

describe('reports', () => {
  describe('renderEmail (statistics)', () => {
    const rendered = renderEmail({ statistics })

    it('renders a statistics title with the day', () => {
      expect(rendered.title).to.include('Tagesbericht Statistik')
      expect(rendered.title).to.include('13.')
      expect(rendered.title).to.include('2026')
      expect(rendered.text).to.be.a('string')
    })

    it('renders the practice total without a 30-day or previous-year comparison', () => {
      expect(rendered.text).to.include('ORDINATION GESAMT')
      expect(rendered.text).to.include('Termine gesamt: 512')
      expect(rendered.text).not.to.include('VJ')
      expect(rendered.text).not.to.include('30 Tage')
      expect(rendered.text).to.include('Kasse / Privat: 300 / 212')
    })

    it('renders one block per doctor', () => {
      expect(rendered.text).to.include('PRO ÄRZTIN')
      expect(rendered.text).to.include('Dr. A')
      expect(rendered.text).to.include('Termine 120')
    })
  })
})
