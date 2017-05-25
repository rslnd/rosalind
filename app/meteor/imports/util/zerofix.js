// Split phone number at whitespaces. If the word contains a number,
// replace all letters 'O' or 'o' with zeroes. Join back together.
export const zerofix = (telephone, options = {}) => {
  if (!telephone) { return }

  const withZeroesReplaced = telephone.split(/\s/g).map((word) => {
    if (word.match(/\d/g)) {
      return word.replace(/o/gi, '0')
    } else {
      return word
    }
  }).join(' ')

  // If it's just a long string of digits, split into groups of 4
  if (!options.dontSplit && telephone.indexOf(' ') === -1 && telephone.match(/\d/g)) {
    return withZeroesReplaced.match(/.{1,4}/g).join(' ')
  }

  return withZeroesReplaced
}
