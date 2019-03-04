import React from 'react'
import { Meteor } from 'meteor/meteor'
import Alert from 'react-s-alert'
import { compose, mapProps } from 'recompose'
import { Roles } from 'meteor/alanning:roles'
import { Button } from '@material-ui/core'
import { reduxForm, Field } from 'redux-form'
import { __ } from '../../i18n'
import { Icon } from '../components/Icon'
import { TextField } from '../components/form/TextField'

const onSubmit = ({ roles }, dispatch, props) =>
  new Promise((resolve, reject) => {
    const rolesArray = roles.replace(/\s/ig, '').split(',')
    Meteor.call('users/updateRoles', {
      userId: props.user._id,
      roles: rolesArray
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

const Fields = ({ handleSubmit, submitting, invalid, validating, pristine, user }) =>
  <form onSubmit={handleSubmit}>
    <Field
      name='roles'
      component={TextField}
      label={__('users.roles')}
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
          : __('users.changeRoles')
      }</Button>
  </form>

export const ChangeRolesForm = compose(
  mapProps(props => ({
    ...props,
    initialValues: {
      roles: Roles.getRolesForUser(props.user._id).join(', ')
    }
  })),
  reduxForm({
    form: 'changeRoles',
    enableReinitialize: true,
    onSubmit
  })
)(Fields)
