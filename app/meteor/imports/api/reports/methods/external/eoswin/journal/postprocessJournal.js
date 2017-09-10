import mapValues from 'lodash/fp/mapValues'
import map from 'lodash/map'

export const postprocessJournal = journal => {
  const assignees = map(journal, transformAssignee)
  return { assignees }
}

const transformAssignee = ({ type, ...values }, assigneeId) => {
  const patients = mapValues(transformPatients)(values)

  if (type) {
    return {
      type,
      assigneeId,
      patients
    }
  } else {
    return {
      assigneeId,
      patients
    }
  }
}

const transformPatients = p => {
  return { actual: p }
}
