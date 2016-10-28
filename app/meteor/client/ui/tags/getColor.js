import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'
import sortBy from 'lodash/fp/sortBy'
import { Tags } from 'api/tags'

export const getColor = (tags = []) => {
  if (tags.length === 0) {
    return '#ccc'
  } else {
    return flow(
      map((tagId) => {
        return Tags.findOne({ _id: tagId })
      }),
      sortBy('order'),
      map((tag) => {
        return (tag && tag.color) || '#ccc'
      })
    )(tags)[0]
  }
}
