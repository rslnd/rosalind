import { Tags } from '../../api/tags'
import { tagBackgroundColor } from '../tags/TagsList'

export const getColor = (tags = [], defaultColor) => {
  if (!tags || tags.length === 0) {
    return defaultColor || tagBackgroundColor
  } else {
    const firstTag = Tags.methods.expand(tags)[0]
    return firstTag.color || defaultColor || tagBackgroundColor
  }
}
