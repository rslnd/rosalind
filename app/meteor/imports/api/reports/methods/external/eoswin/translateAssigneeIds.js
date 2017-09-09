export const translateAssigneeIds = mapIds => report => {
  const originalIds = Object.keys(report)

  return originalIds.reduce((acc, originalId) => {
    const translatedId = mapIds(originalId)

    if (translatedId) {
      return {
        ...acc,
        [ translatedId ]: report[originalId]
      }
    } else if (hasTypeField(report[originalId])) {
      return {
        ...acc,
        [ originalId ]: report[originalId]
      }
    } else {
      throw new Error(`Could not translate EOSWin id ${originalId}`)
    }
  }, {})
}

const hasTypeField = obj =>
  obj && (typeof obj === 'object') && obj.type
