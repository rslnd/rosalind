import idx from 'idx'
import React from 'react'
import { Meteor } from 'meteor/meteor'
import { Users } from '../../api/users'
import { compose, withState, mapProps, withHandlers } from 'recompose'
import Alert from 'react-s-alert'
import { __ } from '../../i18n'
import { Button } from '@material-ui/core'
import { reduxForm, Field } from 'redux-form'
import { TextField } from '../components/form/TextField'
import { important } from '../layout/styles'
import { Icon } from '../components/Icon'

const Fields = ({ submitting, handleUnsetPassword, hasPassword, weakPassword }) =>
  <div>
    <p>
      {
        !hasPassword
        ? __('users.hasNoPassword')
        : weakPassword
        ? <span style={important}>{__('users.passwordBreached', { breachCount: weakPassword })}</span>
        : __('users.hasPassword')
      }
    </p>
    <Button
      type='submit'
      color='primary'
      variant='raised'
      fullWidth
      disabled={!hasPassword}
      onClick={handleUnsetPassword}
    >{
      submitting
      ? <Icon name='refresh' spin />
      : __('users.unsetPassword')
    }</Button>
  </div>

const handleUnsetPassword = ({ user, setSubmitting }) => () =>
  new Promise((resolve, reject) => {
    setSubmitting(true)
    Meteor.call('users/unsetPassword', {
      userId: user._id
    }, (e) => {
      setSubmitting(false)
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

export const UnsetPasswordForm = compose(
  withState('submitting', 'setSubmitting', false),
  mapProps(props => ({
    ...props,
    hasPassword: (Object.keys((idx(props, _ => _.user.services.password) || {})).length >= 1),
    weakPassword: props.user.weakPassword
  })),
  withHandlers({
    handleUnsetPassword
  })
)(Fields)
