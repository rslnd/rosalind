import { Users } from '../../api/users'
import { DocumentPicker } from '../components/DocumentPicker'
import { withProps } from 'recompose'

export const UserPicker = withProps({
  toDocument: _id => Users.findOne({ _id }, { removed: true }),
  toLabel: user => Users.methods.fullNameWithTitle(user),
  options: () => {
    const selector = { groupId: { $ne: null }, removed: { $ne: true } }
    return Users.find(selector, {
      sort: { lastName: 1 }
    }).fetch()
  }
})(DocumentPicker)
