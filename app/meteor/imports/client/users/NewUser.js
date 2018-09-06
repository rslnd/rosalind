import React from 'react'
import { ContentHeader } from '../components/ContentHeader'
import { Box } from '../components/Box'
import Alert from 'react-s-alert'
import { withTracker } from '../components/withTracker'
import { __ } from '../../i18n'
import { Users } from '../../api/users'
import { Icon } from '../components/Icon'
import { TextField } from '../components/form/TextField'
import { asyncValidate as asyncValidatePassword, validate as validatePassword } from './ChangePasswordForm'
import { ChangeRolesForm } from './ChangeRolesForm'
import { UserProfileFields } from './UserProfileForm'
import { reduxForm, Field } from 'redux-form'
import { Button } from '@material-ui/core'

const NewUserScreen = ({ submitting, invalid, validating, pristine, handleSubmit }) =>
  <div>
    <ContentHeader>
      <Icon name='user-plus' /> {__('users.thisNew')}
    </ContentHeader>
    <div className='content'>
      <div className='row'>
        <div className='col-md-12'>
          <Box title={__('users.profile')} type='primary'>
            <form onSubmit={handleSubmit}>
              <UserProfileFields />

              <Field
                name='password'
                component={TextField}
                type='password'
                label={__('users.password')}
              />

              <Field
                name='roles'
                component={TextField}
                label={__('users.roles')}
              />

              <br /><br />

              <Button
                type='submit'
                color='primary'
                variant='raised'
                fullWidth
                disabled={submitting || invalid || validating || pristine}
                onClick={handleSubmit}
              >{
                submitting || validating
                ? <Icon name='refresh' spin />
                : __('users.thisSave')
              }</Button>
            </form>
          </Box>
        </div>
      </div>
    </div>
  </div>

const onSubmit = values =>
  Users.actions.insert.callPromise(values)
  .then(() => Alert.success(__('ui.saved')))
  .catch((e) => {
    console.error(e)
    Alert.error(__('ui.error'))
  })

const validateProfile = ({ username }) => {
  if (!username) {
    return { username: __('ui.required') }
  }

  if (Users.findOne({ username })) {
    return { username: __('users.usernameTaken') }
  }
}

const validate = values => {
  return {
    ...validatePassword(values),
    ...validateProfile(values)
  }
}

const asyncValidate = values =>
  Promise.all([
    asyncValidatePassword(values)
  ])

export const NewUser = reduxForm({
  form: 'newUser',
  asyncValidate,
  validate,
  onSubmit
})(NewUserScreen)
