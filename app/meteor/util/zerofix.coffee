map = require 'lodash/map'

# Split phone number at whitespaces. If the word contains a number,
# replace all letters 'O' or 'o' with zeroes. Join back together.
module.exports =
  zerofix: (telephone) ->
    return unless telephone?
    telephone = map telephone.split(/\s/g), (word) ->
      if word.match(/\d/g)
        word.replace(/o/gi, '0')
      else word
    telephone = telephone.join(' ')

    # If it's just a long string of digits, split into groups of 4
    if (telephone.indexOf(' ') is -1 and telephone.match(/\d/g))
      telephone.match(/.{1,4}/g).join(' ')
    else
      telephone
