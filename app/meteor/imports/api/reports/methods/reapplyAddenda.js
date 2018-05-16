import identity from 'lodash/fp/identity'
import flatten from 'lodash/flatten'
import { merge } from './merge'

export const reapplyAddenda = originalReport => newReport => newAddendum => {
  if (!originalReport.addenda) {
    return applyAddendum(newReport)(newAddendum)
  }

  const addendaToApply = [
    ...originalReport.addenda,
    newAddendum
  ].filter(identity)

  if (addendaToApply.length > 0) {
    return addendaToApply.reduce((acc, addendum) => {
      return applyAddendum(acc)(addendum)
    }, newReport)
  } else {
    return newReport
  }
}

export const applyAddendum = report => addendum => {
  if (!addendum) { return report }

  return {
    ...merge(report, addendum),
    addenda: flatten([
      (report.addenda || null),
      addendum
    ]).filter(identity)
  }
}
