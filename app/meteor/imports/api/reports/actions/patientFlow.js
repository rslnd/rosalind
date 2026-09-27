import { action, Optional, Match } from '../../../util/meteor/action'
import { computePatientFlow } from '../methods/computePatientFlow'

// Freely parametrizable patient-flow analysis: a list of cohorts, each with its
// own period / doctor / appointment-type filter, optionally overlaid with the
// previous year (`compare`). Uses the shared action() helper (role check +
// isAllowed guard) rather than a bare ValidatedMethod. Server-only: simulation
// is disabled so the client's optimistic simulation returns early.
export const patientFlow = ({ Appointments, Users }) => {
  return action({
    name: 'reports/patientFlow',
    roles: ['reports', 'admin'],
    simulation: false,
    args: {
      series: [Match.ObjectIncluding({
        id: String,
        label: String,
        from: Date,
        to: Date,
        assigneeIds: Optional([String]),
        tags: Optional([String])
      })],
      compare: Optional(Boolean)
    },
    fn ({ series, compare }) {
      return computePatientFlow({ Appointments, Users, series, compare })
    }
  })
}
