import mapValues from 'lodash/fp/mapValues'
import map from 'lodash/fp/map'

export const postprocessJournal = journal => {
  const assignees = map(transformAssignee)(journal)
  return { assignees }
}

const transformAssignee = ({ assignee, ...rest }) => {
  const patients = mapValues(transformPatients)(rest)

  return {
    assigneeId: assignee,
    patients
  }
}

const transformPatients = p => {
  return { actual: p }
}
