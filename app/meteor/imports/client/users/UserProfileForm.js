import React from 'react'
import { Meteor } from 'meteor/meteor'
import Alert from 'react-s-alert'
import { Users } from '../../api/users'
import { compose, mapProps } from 'recompose'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { reduxForm, Field } from 'redux-form'
import { __ } from '../../i18n'
import { Icon } from '../components/Icon'
import { TextField } from '../components/form/TextField'
import { NameFields } from '../patients/fields/NameFields'
import { Checkbox } from '../components/form/Checkbox'
import { GroupPickerField } from '../users/GroupPicker'

const onSubmit = (fields, dispatch, props) =>
  new Promise((resolve, reject) => {
    Meteor.call('users/updateProfile', {
      userId: props.user._id,
      ...fields
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

export const UserProfileFields = () =>
  <div>
    <NameFields gender={false} titles />

    <div className='row'>
      <div className='col-md-2'>
        <Field
          name='username'
          component={TextField}
          label={__('users.username')}
        />
      </div>

      <div className='col-md-3'>
        <Field
          name='employee'
          component={props =>
            <FormControlLabel
              control={<Checkbox {...props} />}
              label={__('users.employee')}
            />
          }
        />

        <Field
          name='hiddenInReports'
          component={props =>
            <FormControlLabel
              control={<Checkbox {...props} />}
              label={__('users.hiddenInReports')}
            />
          }
        />
      </div>

      <div className='col-md-7' style={{ paddingTop: 10 }}>
        <Field
          name='groupId'
          component={GroupPickerField}
          label={__('users.group')}
        />
      </div>
    </div>
  </div>

const Fields = ({ handleSubmit, submitting, invalid, validating, pristine, user }) =>
  <form onSubmit={handleSubmit}>

    <UserProfileFields />
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
          : __('users.saveProfile')
      }</Button>
  </form>

export const UserProfileForm = compose(
  mapProps(props => {
    // Do not pass unneccessary fields to redux form
    const {
        username,
        firstName,
        lastName,
        titlePrepend,
        titleAppend,
        employee,
        groupId,
        hiddenInReports
    } = Users.findOne({ _id: props.user._id }, { removed: true })

    return {
      ...props,
      initialValues: {
        username,
        firstName,
        lastName,
        titlePrepend,
        titleAppend,
        employee,
        groupId,
        hiddenInReports
      }
    }
  }),
  reduxForm({
    form: 'userProfile',
    enableReinitialize: true,
    onSubmit
  })
)(Fields)
