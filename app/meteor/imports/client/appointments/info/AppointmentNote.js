import React from 'react'
import { Field } from 'redux-form'
import { ListItem } from './ListItem'
import { TextField } from '../../components/form'
import { __ } from '../../../i18n'

export const AppointmentNote = ({ appointment }) =>
  <ListItem icon='pencil' hr highlight={!!appointment.note}>
    <Field
      name='note'
      label={__('appointments.note')}
      multiline
      rows={3}
      component={TextField}
      fullWidth
    />
  </ListItem>
