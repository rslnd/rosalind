import React from 'react'
import { ContentHeader } from '../components/ContentHeader'
import { Box } from '../components/Box'
import { withTracker } from '../components/withTracker'
import { __ } from '../../i18n'
import { Users } from '../../api/users'
import { Icon } from '../components/Icon'
import { ChangePasswordForm } from './ChangePasswordForm'
import { ChangeRolesForm } from './ChangeRolesForm'
import { UserProfileForm } from './UserProfileForm'

const composer = (props) => {
  const _id = props.match.params.id
  console.log(props, _id)
  const user = Users.findOne({ _id })

  if (!user) {
    return { isLoading: true }
  }

  return { user }
}

const EditUser = ({ user }) =>
  <div>
    <ContentHeader>
      <Icon name='user' /> {Users.methods.fullNameWithTitle(user)} - <b>{user.username}</b>
    </ContentHeader>
    <div className='content'>
      <div className='row'>
        <div className='col-md-12'>
          <Box title={__('users.editProfile')} type='primary'>
            <UserProfileForm user={user} />
          </Box>
        </div>
      </div>
      <div className='row'>
        <div className='col-md-4'>
          <Box title={__('users.changePassword')} type='warning'>
            <ChangePasswordForm user={user} />
          </Box>
        </div>

        <div className='col-md-8'>
          <Box title={__('users.changeRoles')} type='danger'>
            <ChangeRolesForm user={user} />
          </Box>
        </div>
      </div>
    </div>
  </div>

export const EditUserContainer = withTracker(composer)(EditUser)
