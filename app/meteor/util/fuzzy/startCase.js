export const startCase = (string) => {
  return string.split(/\s/).map((token) => {
    return token.charAt(0).toUpperCase() + token.toLowerCase().substr(1)
  }).join(' ')
}
