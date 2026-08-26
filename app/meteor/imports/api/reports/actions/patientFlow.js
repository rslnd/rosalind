import { action, Optional } from '../../../util/meteor/action'
import { computePatientFlow } from '../methods/computePatientFlow'

// Freely parametrizable patient-flow analysis (period / doctor / tags / compare).
// Uses the shared action() helper (role check + isAllowed guard) rather than a
// bare ValidatedMethod. Server-only: simulation is disabled so the client's
// optimistic simulation returns early.
export const patientFlow = ({ Appointments, Users }) => {
  return action({
    name: 'reports/patientFlow',
    roles: ['reports', 'admin'],
    simulation: false,
    args: {
      from: Date,
      to: Date,
      assigneeIds: Optional([String]),
      tags: Optional([String]),
      compareFrom: Optional(Date),
      compareTo: Optional(Date)
    },
    fn ({ from, to, assigneeIds, tags, compareFrom, compareTo }) {
      return computePatientFlow({
        Appointments, Users,
        from, to, assigneeIds, tags, compareFrom, compareTo
      })
    }
  })
}
