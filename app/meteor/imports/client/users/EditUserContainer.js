import React from 'react'
import { ContentHeader } from '../components/ContentHeader'
import { Box } from '../components/Box'
import { withTracker } from '../components/withTracker'
import { __ } from '../../i18n'
import { Users } from '../../api/users'
import { Icon } from '../components/Icon'
import { ChangePasswordForm } from './ChangePasswordForm'
import { UnsetPasswordForm } from './UnsetPasswordForm'
import { ChangePasswordlessForm } from './ChangePasswordlessForm'
import { ChangeRolesForm } from './ChangeRolesForm'
import { UserProfileForm } from './UserProfileForm'
import { RemoveUserForm, RestoreUser } from './RemoveUserForm'
import { ExternalIdsForm } from './ExternalIdsForm'
import { subscribe } from '../../util/meteor/subscribe'

const composer = (props) => {
  subscribe('users-permissions')

  const _id = props.match.params.id
  const user = Users.findOne({ _id }, { removed: true })

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
          <Box title={__('users.passwordlessLogin')} type='warning'>
            <ChangePasswordlessForm user={user} />
          </Box>
        </div>

        <div className='col-md-4'>
          <Box title={__('users.changePassword')} type='warning'>
            <ChangePasswordForm user={user} />
          </Box>
        </div>

        <div className='col-md-4'>
          <Box title={__('users.unsetPassword')} type='warning'>
            <UnsetPasswordForm user={user} />
          </Box>
        </div>
      </div>

      <div className='row'>

        <div className='col-md-8'>
          <Box title={__('users.changeRoles')} type='warning'>
            <ChangeRolesForm user={user} />
          </Box>
        </div>

        <div className='col-md-4'>
          <Box title='Externe IDs' type='primary'>
            <ExternalIdsForm user={user} />
          </Box>
        </div>
      </div>

      <div className='row'>
        <div className='col-md-4'>
          {
            user.removed
            ? <Box title={__('ui.restore')} type='danger'>
              <RestoreUser user={user} />
            </Box>
            : <Box title={__('users.remove')} type='danger'>
              <RemoveUserForm user={user} />
            </Box>
          }
        </div>
      </div>

    </div>
  </div>

export const EditUserContainer = withTracker(composer)(EditUser)
