import React from 'react'
import { Field } from 'redux-form'
import { Switch } from 'redux-form-material-ui'
import { __ } from '../../../i18n'
import { ListItem } from './ListItem'

export const Reminders = () => (
  <ListItem icon='paper-plane'>
    {__('appointments.appointmentReminderSMS')}
    <div className='pull-right' style={{
      position: 'relative',
      right: 5,
      top: -15
    }}>
      <Field
        name='reminders'
        color='primary'
        component={Switch}
      />
    </div>
    <br /><br />
  </ListItem> || null
)
