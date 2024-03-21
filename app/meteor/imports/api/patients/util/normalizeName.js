import slugify from 'slugify'

export const normalizeName = (name) => {
  if (typeof name !== 'string') {
    return ''
  }

  return slugify(name, {
    locale: 'de'
  }).toUpperCase()
}
