import React from 'react'
import { Meteor } from 'meteor/meteor'
import { Users } from '../../api/users'
import Alert from 'react-s-alert'
import { __ } from '../../i18n'
import Button from '@material-ui/core/Button'
import { reduxForm, Field } from 'redux-form'
import { TextField } from '../components/form/TextField'
import { Icon } from '../components/Icon'

const Fields = ({ handleSubmit, submitting, invalid, validating, pristine }) =>
  <form onSubmit={handleSubmit}>
    <Field
      name='password'
      component={TextField}
      type='password'
      label={__('users.newPassword')}
    />

    <br /><br />

    <Button
      type='submit'
      color='primary'
      variant='contained'
      fullWidth
      disabled={submitting || invalid || validating || pristine}
      onClick={handleSubmit}
    >{
        submitting || validating
          ? <Icon name='refresh' spin />
          : __('users.changePassword')
      }</Button>
  </form>

export const asyncValidate = async ({ password }) => {
  const breachCount = await Users.methods.isWeakPassword(password)
  if (breachCount && breachCount > 0) {
    throw { password: __('users.passwordBreached', { breachCount }) } // eslint-disable-line
  }
}

export const validate = ({ password }, props) => {
  const minLength = 12
  if (!password || password.length < minLength) {
    return { password: __('users.passwordMinLength', { minLength }) }
  }

  if (props && props.user) {
    const profile = JSON.stringify(props.user)
    const profileContainsPassword = profile.toLowerCase().indexOf(password.toLowerCase()) !== -1
    if (profileContainsPassword) {
      return { password: __('users.profileContainsPassword') }
    }
  }

  return {}
}

const onSubmit = ({ password }, dispatch, props) =>
  new Promise((resolve, reject) => {
    Meteor.call('users/updatePassword', {
      userId: props.user._id,
      password: password
    }, (e) => {
      if (e) {
        console.error(e)
        Alert.error(__('ui.error'))
        reject(e)
      } else {
        Alert.success(__('ui.saved'))
        resolve()
      }
    })
  })

export const ChangePasswordForm = reduxForm({
  form: 'change-password',
  asyncChangeFields: 'password',
  asyncValidate,
  validate,
  onSubmit
})(Fields)
