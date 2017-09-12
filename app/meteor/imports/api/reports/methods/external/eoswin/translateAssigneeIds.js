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
      throw new Error(`Could not translate EOSWin id ${originalId}`)
    }
  }, {})
}
