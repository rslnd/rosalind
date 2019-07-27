import React from 'react'
import { Meteor } from 'meteor/meteor'
import Alert from 'react-s-alert'
import { compose, withProps } from 'recompose'
import Button from '@material-ui/core/Button'
import { reduxForm, Field, formValueSelector } from 'redux-form'
import { connect } from 'react-redux'
import { __ } from '../../i18n'
import { Icon } from '../components/Icon'
import { TextField } from '../components/form/TextField'
import { Groups } from '../../api/groups'
import identity from 'lodash/identity'
import { effectiveRoles } from '../../util/meteor/hasRole'

const onSubmit = ({ addedRoles, removedRoles }, dispatch, props) =>
  new Promise((resolve, reject) => {
    Meteor.call('users/updateRoles', {
      userId: props.user._id,
      addedRoles: stringToRoles(addedRoles),
      removedRoles: stringToRoles(removedRoles)
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

const Fields = ({ handleSubmit, submitting, invalid, validating, pristine, user, addedRoles, removedRoles, baseRoles }) =>
  <form onSubmit={handleSubmit}>
    Gruppenberechtigungen:<br />
    {rolesToString(baseRoles)}

    <Field
      name='addedRoles'
      component={TextField}
      label={__('users.addedRoles')}
    />

    <Field
      name='removedRoles'
      component={TextField}
      label={__('users.removedRoles')}
    />

    Effektive Berechtigungen<br />
    <b>{rolesToString(effectiveRoles({ baseRoles, addedRoles, removedRoles }))}</b>

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

export const rolesToString = r => (r || []).filter(identity).join(', ')
export const stringToRoles = s => s.split(',').map(s => s.trim()).filter(identity)

const selector = formValueSelector('changeRoles')

export const ChangeRolesForm = compose(
  withProps(props => {
    const group = Groups.findOne({ _id: props.user.groupId })
    const baseRoles = (group && group.baseRoles) || []

    return {
      baseRoles,
      initialValues: {
        addedRoles: rolesToString(props.user.addedRoles),
        removedRoles: rolesToString(props.user.removedRoles)
      }
    }
  }),
  reduxForm({
    form: 'changeRoles',
    enableReinitialize: true,
    onSubmit
  }),
  connect(state => ({
    addedRoles: stringToRoles(selector(state, 'addedRoles')),
    removedRoles: stringToRoles(selector(state, 'removedRoles'))
  }))
)(Fields)
