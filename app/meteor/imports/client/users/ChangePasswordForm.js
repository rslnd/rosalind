import React from 'react'
import { Meteor } from 'meteor/meteor'
import { Users } from '../../api/users'
import Alert from 'react-s-alert'
import { __ } from '../../i18n'
import { Button } from '@material-ui/core'
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
      variant='raised'
      fullWidth
      disabled={submitting || invalid || validating || pristine}
      onClick={handleSubmit}
    >{
      submitting || validating
      ? <Icon name='refresh' spin />
      : __('users.changePassword')
    }</Button>
  </form>

const asyncValidate = async ({ password }) => {
  const breachCount = await Users.methods.isWeakPassword(password)
  if (breachCount && breachCount > 0) {
    throw { password: `Dieses Passwort wurde ${breachCount} Mal im Internet gefunden. Bitte ein sicheres, einmaliges Passwort wählen.` } // eslint-disable-line
  }
}

const validate = ({ password }, props) => {
  if (!password || password.length < 8) {
    return { password: `Bitte ein sicheres Passwort mit mindestens 8 Zeichen wählen` }
  }

  const profile = JSON.stringify(props.user)
  const profileContainsPassword = profile.toLowerCase().indexOf(password.toLowerCase()) !== -1
  if (profileContainsPassword) {
    return { password: 'Bitte ein anderes, sicheres Passwort wählen' }
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
