import React from 'react'
import { withRouter } from 'react-router-dom'
import { Users } from '../../api/users'
import { compose, withState, withHandlers } from 'recompose'
import Alert from 'react-s-alert'
import { __ } from '../../i18n'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { Icon } from '../components/Icon'

const Fields = ({ submitting, handleRemove, doubleCheck, handleToggleDoubleCheck }) =>
  <div>
    <FormControlLabel
      control={<Checkbox
        checked={doubleCheck}
        onClick={handleToggleDoubleCheck}
      />}
      label={__('users.confirmRemove')}
    />

    <Button
      type='submit'
      color={'secondary'}
      variant='contained'
      fullWidth
      disabled={submitting || !doubleCheck}
      onClick={handleRemove}
    >{
        submitting
          ? <Icon name='refresh' spin />
          : __('users.remove')
      }</Button>
  </div>

const handleRemove = ({ setSubmitting, history, user }) => async () => {
  try {
    setSubmitting(true)
    await Users.actions.remove.callPromise({ userId: user._id })
    setSubmitting(false)
    Alert.success(__('ui.deleted'))
    history.push('/users')
  } catch (e) {
    setSubmitting(false)
    console.error(e)
    Alert.error(__('ui.error'))
  }
}

export const RemoveUserForm = compose(
  withRouter,
  withState('submitting', 'setSubmitting', false),
  withState('doubleCheck', 'setDoubleCheck', false),
  withHandlers({
    handleRemove,
    handleToggleDoubleCheck: props => e => props.setDoubleCheck(!props.doubleCheck)
  })
)(Fields)

export const RestoreUser = ({ user }) => {
  const handleRestore = async () => {
    try {
      await Users.actions.restore.callPromise({ userId: user._id })
      Alert.success(__('ui.restored'))
    } catch (e) {
      console.error(e)
      Alert.error(__('ui.error'))
    }
  }

  return <div>
    {__('users.ensureUniqueUsername')}
    <br /><br />
    <Button
      type='submit'
      color={'secondary'}
      variant='contained'
      fullWidth
      onClick={handleRestore}
    >{
        __('users.restore')
    }</Button>
  </div>
}
