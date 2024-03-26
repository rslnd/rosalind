export const startCase = (string) => {
  return string.split(/\s/).map((token) => {
    return token.charAt(0).toUpperCase() + token.toLowerCase().substr(1)
  }).join(' ').split('-').map((token) => {
    return token.charAt(0).toUpperCase() + token.substr(1) // don't lowercase the rest as from before
  }).join('-')
}
