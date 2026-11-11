/* eslint-env mocha */
import { expect } from 'chai'
import { renderEmail } from './renderEmail'

const statistics = {
  current: {
    from: new Date('2026-11-11T00:00:00'),
    to: new Date('2026-11-11T23:59:59'),
    total: {
      total: 512,
      expected: 502,
      canceled: 10,
      admitted: 470,
      insurance: 300,
      private: 212,
      internal: 382,
      noShow: 32,
      noShowRate: 0.0637,
      online: 130,
      onlineNoShow: 10,
      onlineNoShowRate: 0.08,
      slotsAvailable: 600,
      scheduledHours: 80,
      timeUtilization: 0.72,
      slotUtilization: 0.41,
      patientsPerHour: 5.875
    }
  },
  assignees: [
    {
      assigneeId: 'a1',
      name: 'Dr. A',
      current: {
        total: 120,
        admitted: 110,
        insurance: 80,
        private: 40,
        noShow: 6,
        noShowRate: 0.05,
        timeUtilization: 0.75,
        calendarSlotUtilization: 0.8,
        slotsAvailable: 150,
        scheduledHours: 8,
        patientsPerHour: 13.75,
        online: 20
      }
    },
    {
      assigneeId: null,
      type: 'einschub',
      name: 'Einschub',
      current: { total: 12, admitted: 12, insurance: 10, private: 2 }
    }
  ]
}

describe('reports', () => {
  describe('renderEmail (statistics)', () => {
    const rendered = renderEmail({ statistics })

    it('renders the day with weekday in the subject', () => {
      expect(rendered.title).to.equal('Tagesbericht – Mi., 11. Nov. 2026')
      expect(rendered.text).to.be.a('string')
    })

    it('renders the same headline figures as the PDF report', () => {
      const t = rendered.text
      expect(t).to.include('ORDINATION GESAMT')
      expect(t).to.include('ÄrztInnen: 1')
      expect(t).to.include('Auslastung: 85,3 %')
      expect(t).to.include('Nicht-erschienen-Quote: 6,4 %')
      expect(t).to.include('PatientInnen / Std: 5,9')
      expect(t).to.include('Slots: 600 (80 h gesamt)')
      expect(t).to.include('Termine: 512 (85,3 % Auslastung)')
      expect(t).to.include('Einschub: 12 (2,3 % der Termine)')
      expect(t).to.include('Kasse: 300 (58,6 % der Termine)')
      expect(t).to.include('Privat: 212 (41,4 % der Termine)')
      expect(t).to.include('Intern vereinbart: 382 (74,6 % der Termine)')
      expect(t).to.include('Online: 130 (25,4 % der Termine)')
      expect(t).to.include('Erschienen: 470 (93,6 % der erwarteten)')
      expect(t).to.include('Nicht erschienen: 32 (6,4 % der erwarteten)')
      expect(t).to.include('Storniert: 10 (2 % der Termine)')
    })

    it('renders a single utilization figure, without a 30-day or previous-year comparison', () => {
      expect(rendered.text).not.to.include('Online-Slots')
      expect(rendered.text).not.to.include('Auslastung (')
      expect(rendered.text).not.to.include('VJ')
      expect(rendered.text).not.to.include('30 Tage')
    })

    it('ends with the PDF note followed by two blank lines', () => {
      expect(rendered.text.endsWith('im PDF-Anhang.\n\n')).to.equal(true)
    })

    it('renders one block per doctor with the table columns of the report', () => {
      expect(rendered.text).to.include('PRO ÄRZTIN')
      expect(rendered.text).to.include('Dr. A')
      expect(rendered.text).to.include('  Geplante Stunden: 8 h')
      expect(rendered.text).to.include('  Auslastung: 80 %')
      expect(rendered.text).to.include('  Slots: 150')
      expect(rendered.text).to.include('  Termine: 120')
      expect(rendered.text).to.include('  Erschienen: 110')
      expect(rendered.text).to.include('  Kasse / Privat: 80 / 40')
      expect(rendered.text).to.include('  PatientInnen / Std: 13,8')
    })
  })
})
