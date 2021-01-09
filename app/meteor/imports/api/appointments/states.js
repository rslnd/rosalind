import identity from 'lodash/identity'

const states = ({ queueing = false, admittedIsTreated = false }) => [
  {
    state: 'planned',
    when: a => !a.admitted && !a.queued,
    primaryActions: ['setAdmitted', (queueing && 'setQueued'), 'setCanceled'].filter(identity),
    secondaryActions: ['setNoShow']
  },
  {
    state: 'queued',
    when: a => a.queued && !a.admitted,
    primaryActions: ['setAdmitted', 'setCanceled'],
    secondaryActions: ['unsetQueued', 'setNoShow']
  },
  {
    state: 'admitted',
    when: a => a.admitted && !a.treatmentStart,
    primaryActions: [(!admittedIsTreated && 'startTreatment')].filter(identity),
    secondaryActions: ['unsetAdmitted', 'setNoShow', 'setCanceled']
  },
  {
    state: 'treating',
    when: a => a.treatmentStart && !a.treatmentEnd,
    primaryActions: ['endTreatment'],
    secondaryActions: ['unsetAdmitted', 'unsetStartTreatment', 'setNoShow', 'setCanceled']
  },
  {
    state: 'treated',
    when: a => a.treated,
    primaryActions: null,
    secondaryActions: ['unsetAdmitted', 'unsetStartTreatment', 'unsetEndTreatment', 'setNoShow', 'setCanceled']
  }
]

export const currentState = (appointment, calendarOptions) =>
  states(calendarOptions).find(s => s.when(appointment))
