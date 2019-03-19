import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'
import sortBy from 'lodash/fp/sortBy'
import { Tags } from '../../api/tags'
import { tagBackgroundColor } from '../tags/TagsList'

export const getColor = (tags = [], defaultColor) => {
  if (!tags || tags.length === 0) {
    return defaultColor || tagBackgroundColor
  } else {
    return flow(
      map((tagId) => {
        return Tags.findOne({ _id: tagId })
      }),
      sortBy('order'),
      map((tag) => {
        return (tag && tag.color) || defaultColor || tagBackgroundColor
      })
    )(tags)[0]
  }
}
