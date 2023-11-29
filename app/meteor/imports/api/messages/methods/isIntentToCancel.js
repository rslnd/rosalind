import some from 'lodash/some'

export const cancelKeywords = ['STORNO', 'NEIN', 'NEİN', 'NEıN', 'NEïN', 'NEIIN', 'NEEIN']

export const isIntentToCancel = (text) => {
  const lower = text.toLowerCase().trim()

  return some(cancelKeywords.map((cancelKeyword) => {
    const keywordPosition = lower.indexOf(cancelKeyword.toLowerCase())
    if (keywordPosition === 0 || keywordPosition === 1) {
      return true
    }
  }))
}
