import { Users } from '../../api/users'
import * as helpers from '../../api/users/methods/name'

export const UserHelper = ({ userId, helper }) => {
  let user = Users.findOne({ _id: userId }, { removed: true })
  if (!user) { return null }

  if (helpers[helper]) {
    return helpers[helper](user)
  } else {
    console.error('No definition for helper', helper)
    return helpers.fullNameWithTitle(user)
  }
}
