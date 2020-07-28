import React from 'react'
import { Users } from '../../api/users'
import { DocumentPicker } from '../components/DocumentPicker'
import { mapProps } from 'recompose'

export const UserPicker = mapProps(props => ({
  ...props,
  toDocument: _id => Users.findOne({ _id }, { removed: true }),
  toLabel: user => user.username + ' ' + Users.methods.fullNameWithTitle(user),
  render: user => <span>
    <span className='text-muted' style={avatarStyle}>{user.username}</span>
    &emsp;
    {Users.methods.fullNameWithTitle(user)}
  </span>,
  options: () => {
    const selector = props.selector || { groupId: { $ne: null }, removed: { $ne: true } }
    return Users.find(selector, {
      sort: { lastName: 1 }
    }).fetch()
  }
}))(DocumentPicker)

const avatarStyle = {
  display: 'inline-block',
  minWidth: '1em'
}
