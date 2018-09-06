import React from 'react'
import { Meteor } from 'meteor/meteor'
import Alert from 'react-s-alert'
import { compose, withProps, withState, withHandlers } from 'recompose'
import { Roles } from 'meteor/alanning:roles'
import { ContentHeader } from '../components/ContentHeader'
import { DocumentPicker } from '../components/DocumentPicker'
import { Box } from '../components/Box'
import { withTracker } from '../components/withTracker'
import { __ } from '../../i18n'
import { Users } from '../../api/users'
import { Icon } from '../components/Icon'
import { Input, Button } from '@material-ui/core'
import { ChangePasswordForm } from './ChangePasswordForm'

const composer = (props) => {
  const _id = props.match.params.id
  console.log(props, _id)
  const user = Users.findOne({ _id })

  if (!user) {
    return { isLoading: true }
  }

  return { user }
}

const RolesPicker = withProps({
  toDocument: _id => Roles.getAllRoles().fetch().find(r => r._id === _id),
  toLabel: group => group.name,
  options: () => Roles.getAllRoles().fetch(),
  isMulti: true
})(DocumentPicker)

const EditUser = ({ user }) =>
  <div>
    <ContentHeader>
      <Icon name='user' /> {__('users.profileFor')} <b>{Users.methods.fullNameWithTitle(user)}</b>
    </ContentHeader>
    <div className='content'>
      <div className='row'>
        <div className='col-md-6'>
          <Box title={__('users.changePassword')} type='warning'>
            <ChangePasswordForm user={user} />
          </Box>
        </div>

        <div className='col-md-6'>
          <Box title={__('users.setRoles')} type='danger'>
            <RolesPicker />
          </Box>
        </div>
      </div>
    </div>
  </div>

export const EditUserContainer = compose(
  withTracker(composer)
)(EditUser)
