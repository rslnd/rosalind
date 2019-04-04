import idx from 'idx'
import React from 'react'
import { Meteor } from 'meteor/meteor'
import { compose, withState, mapProps, withHandlers } from 'recompose'
import Alert from 'react-s-alert'
import { __ } from '../../i18n'
import Button from '@material-ui/core/Button'
import { Icon } from '../components/Icon'

const Fields = ({ submitting, handleToggle, passwordless }) =>
  <div>
    <p>
      {__('users.passwordlessLogin')}:&nbsp;
      <b>{
        passwordless
          ? __('users.passwordessEnabled')
          : __('users.passwordlessDisabled')
      }</b>
    </p>
    <Button
      type='submit'
      color={passwordless ? 'secondary' : 'primary'}
      variant='contained'
      fullWidth
      disabled={submitting}
      onClick={handleToggle}
    >{
        submitting
          ? <Icon name='refresh' spin />
          : passwordless
            ? __('users.disablePasswordless')
            : __('users.enablePasswordless')
      }</Button>
  </div>

const handleToggle = ({ passwordless, user, setSubmitting }) => () =>
  new Promise((resolve, reject) => {
    setSubmitting(true)
    Meteor.call('users/setPasswordless', {
      userId: user._id,
      passwordless: !passwordless
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

export const ChangePasswordlessForm = compose(
  withState('submitting', 'setSubmitting', false),
  mapProps(props => ({
    ...props,
    passwordless: idx(props, _ => _.user.services.passwordless)
  })),
  withHandlers({
    handleToggle
  })
)(Fields)
