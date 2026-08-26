import React from 'react'
import { Meteor } from 'meteor/meteor'
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

// No breach/complexity checks anymore — only a minimum length (see validate).
export const asyncValidate = async () => {}

const MIN_LENGTH = 4

export const validate = ({ password }) => {
  if (!password || password.length < MIN_LENGTH) {
    return { password: __('users.passwordMinLength', { minLength: MIN_LENGTH }) }
  }
  return {}
}

const onSubmit = ({ password }, dispatch, props) =>
  new Promise((resolve, reject) => {
    Meteor.call('users/updatePassword', {
      userId: props.user._id,
      password
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
