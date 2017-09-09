import mapValues from 'lodash/fp/mapValues'

export const postprocessJournal = journal => {
  const assignees = journal.map(transformAssignee)
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
