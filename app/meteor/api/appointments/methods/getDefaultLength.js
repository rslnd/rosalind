import max from 'lodash/max'
import { Users } from 'api/users'
import { Tags } from 'api/tags'

const defaultLength = 5

export const getDefaultLength = ({ assigneeId, tags }) => {
  let assigneeLength
  let tagLengths = []

  if (assigneeId) {
    const user = Users.findOne({ _id: assigneeId })
    if (user && user.settings && user.settings.appointments && user.settings.appointments.defaultLength) {
      assigneeLength = user.settings.appointments.defaultLength
    }
  }

  if (tags) {
    tagLengths = Tags.find({ _id: { $in: tags } }).fetch().map(t => t.length)
  }

  const maxLength = max([ assigneeLength, ...tagLengths ])

  return maxLength || defaultLength
}
