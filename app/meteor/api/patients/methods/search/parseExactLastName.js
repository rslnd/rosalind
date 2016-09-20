import map from 'lodash/fp/map'

export const parseExactLastName = (query) => {
  const pattern = /(\w{2,})/g
  const match = query.match(pattern)
  const remainingQuery = query.replace(pattern, '')

  const $or = map((token) => {
    return { 'profile.lastName': token }
  })(match)

  if ($or.length > 0) {
    return { result: { $or }, remainingQuery }
  } else {
    return { result: false, remainingQuery }
  }
}
