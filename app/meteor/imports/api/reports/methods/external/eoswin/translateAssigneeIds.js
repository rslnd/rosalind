import { specialAssigneeType } from './mapUserIds'

export const translateAssigneeIds = mapIds => report => {
  const originalIds = Object.keys(report)

  return originalIds.reduce((acc, originalId) => {
    const translatedId = mapIds(originalId)
    const type = specialAssigneeType(originalId)

    if (translatedId) {
      return {
        ...acc,
        [ translatedId ]: report[originalId]
      }
    } else if (type) {
      const { assigneeId, ...rest } = report[originalId]
      return {
        ...acc,
        [ type ]: { ...rest, type }
      }
    } else {
      if (originalId) {
        throw new Error(`Could not translate EOSWin id ${originalId}`)
      } else {
        console.error(`Could not translate EOSWin id ${originalId} - ignoring since the external id seems to be falsy/empty string typeof ${typeof originalId}`)
        return acc
      }
    }
  }, {})
}
