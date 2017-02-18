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
      const trimmed = lower.replace(/[^a-z]/g, '')
      return (leven(trimmed, cancelKeyword.toLowerCase()) <= fuzzyness)
    }
  }))
}
