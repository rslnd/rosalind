import leven from 'leven'

export const cancelKeyword = 'STORNO'
const fuzzyness = 3

export const isIntentToCancel = (text) => {
  const lower = text.toLowerCase().trim()

  if (lower.indexOf(cancelKeyword.toLowerCase()) === 0) {
    return true
  } else {
    const trimmed = lower.replace(/[^a-z]/g, '')
    return (leven(trimmed, cancelKeyword.toLowerCase()) <= fuzzyness)
  }
}
