export const normalizeName = (name) => {
  return name
    .toUpperCase()
    .replace(/[^A-Za-z]/g, '')
}
