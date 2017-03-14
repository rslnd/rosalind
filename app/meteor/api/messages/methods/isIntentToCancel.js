import leven from 'leven'
import some from 'lodash/some'

export const cancelKeywords = ['STORNO', 'NEIN']
const fuzzyness = 3

export const isIntentToCancel = (text) => {
  const lower = text.toLowerCase().trim()

  return some(cancelKeywords.map((cancelKeyword) => {
    if (lower.indexOf(cancelKeyword.toLowerCase()) === 0) {
      return true
    } else {
      // Accept misspelled cancel keyword as the first or second word
      const tokens = lower.split(/[^a-z]/g)
      return some(tokens.map((token) => {
        return (leven(token, cancelKeyword.toLowerCase()) <= fuzzyness)
      }).splice(0, 2))
    }
  }))
}
