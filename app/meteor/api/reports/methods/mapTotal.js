import flatten from 'lodash/flatten'
import uniq from 'lodash/uniq'
import add from 'lodash/add'
import fromPairs from 'lodash/fromPairs'

const mapPatients = ({ report }) => {
  const tags = uniq(flatten(report.assignees.map((assignee) => {
    return Object.keys(assignee.patients)
  })))

  const byTag = tags.map((tag) => {
    const sum = report.assignees.map((assignee) => {
      return (assignee.patients[tag] && assignee.patients[tag].planned || 0)
    }).reduce(add)

    return [ tag, { planned: sum } ]
  })

  return fromPairs(byTag)
}

export const mapTotal = ({ report }) => {
  const patients = mapPatients({ report })

  return {
    patients
  }
}
