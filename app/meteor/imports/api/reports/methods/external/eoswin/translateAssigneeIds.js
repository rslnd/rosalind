export const translateAssigneeIds = mapIds => report => {
  const originalIds = Object.keys(report)

  return originalIds.reduce((acc, originalId) => {
    const translatedId = mapIds(originalId)

    if (translatedId) {
      return {
        ...acc,
        [ translatedId ]: report[originalId]
      }
    } else {
      throw new Error(`Could not translate EOSWin id ${originalId}`)
    }
  }, {})
}
