import identity from 'lodash/identity'

const states = ({ queueing = false, admittedIsTreated = false }) => [
  {
    state: 'canceled',
    when: a => a.canceled,
    primaryActions: ['unsetCanceled'],
    secondaryActions: ['setAdmitted', (queueing && 'setQueued'), 'setNoShow'].filter(identity)
  },
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
    secondaryActions: [(queueing && 'unsetQueued'), 'unsetAdmitted', 'setNoShow', 'setCanceled'].filter(identity)
  },
  {
    state: 'treating',
    when: a => a.treatmentStart && !a.treatmentEnd,
    primaryActions: ['endTreatment'],
    secondaryActions: [(queueing && 'unsetQueued'), 'unsetAdmitted', 'unsetStartTreatment', 'setNoShow', 'setCanceled'].filter(identity)
  },
  {
    state: 'treated',
    when: a => a.treated,
    primaryActions: null,
    secondaryActions: [(queueing && 'unsetQueued'), 'unsetAdmitted', 'unsetStartTreatment', 'unsetEndTreatment', 'setNoShow', 'setCanceled'].filter(identity)
  }
]

export const currentState = (appointment, calendarOptions) =>
  states(calendarOptions).find(s => s.when(appointment))
