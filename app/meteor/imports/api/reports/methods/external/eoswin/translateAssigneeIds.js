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
      return {
        ...acc,
        [ type ]: { ...report[originalId], type }
      }
    } else {
      throw new Error(`Could not translate EOSWin id ${originalId}`)
    }
  }, {})
}
