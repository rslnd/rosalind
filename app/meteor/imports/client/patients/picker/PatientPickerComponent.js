import React from 'react'
import Select from 'react-select'
import moment from 'moment'
import { connect } from 'react-redux'
import namecase from 'namecase'
import { withProps } from 'recompose'
import { Icon } from '../../components/Icon'
import { __ } from '../../../i18n'
import { Loading } from '../../components/Loading'
import { PatientName } from '../PatientName'
import { Birthday } from '../Birthday'
import { TagsList } from '../../tags/TagsList'
import { UserHelper } from '../../users/UserHelper'
import { Indicator } from '../../appointments/appointment/Indicator'
import { darkGrayDisabled } from '../../css/global'

const loadingStyle = {
  margin: 0,
  marginTop: 5
}

const components = {
  LoadingIndicator: withProps({ size: 16, style: loadingStyle })(Loading)
}

const noOptionsMessage = () => __('patients.noResults')
const loadingMessage = () => __('patients.searching')

export const PatientPickerComponent = ({
  selectState,
  selectHandlers,
  isOptionSelected,
  filterOption
}) =>
  <Select
    {...selectState}
    {...selectHandlers}
    formatOptionLabel={formatOptionLabel}
    isOptionSelected={isOptionSelected}
    filterOption={filterOption}
    isClearable
    components={components}
    noOptionsMessage={noOptionsMessage}
    loadingMessage={loadingMessage}
    placeholder={__('patients.search')}
  />

const NewPatient = ({ patient }) =>
  <span>
    <Icon name='user-plus' />
    &nbsp;
    {__('patients.thisInsert')}
    {
      patient && <span>
        :
        &nbsp;
        <PatientName patient={patient} />
      </span>
    }
  </span>

const PatientWithAppointments = ({ patient }) =>
  <span>
    <PatientName patient={patient} />
    <span className='text-muted pull-right'>
      &emsp;
      <Birthday day={patient.birthday} />
    </span>
    {
      patient.appointments && patient.appointments.map(appointment =>
        <Appointment
          key={appointment._id}
          appointment={appointment}
        />
      )
    }
  </span>

const Appointment = ({ appointment }) => {
  const start = moment(appointment.start)

  return (
    <span
      style={appointmentStyle}>
      <TagsList tiny tags={appointment.tags} />
      &ensp;
      <span style={{
        textDecoration: appointment.canceled && 'line-through'
      }}>
        {start.format(__('time.dateFormatShort'))}
        &nbsp;
        {start.format(__('time.timeFormat'))}
      </span>
      &emsp;
      {
        appointment.assigneeId &&
          <span style={assigneeNameStyle}>
            <UserHelper userId={appointment.assigneeId} helper='lastNameWithTitle' />
            &emsp;
            <Indicator appointment={appointment} />
          </span>
      }
    </span>
  )
}

const formatOptionLabel = (patient, { context, inputValue, selectValue }) => {
  if (patient.patientId === 'newPatient' || selectValue.patientId === 'newPatient') {
    return <NewPatient patient={patient || selectValue} />
  }

  if (context === 'menu') {
    return <PatientWithAppointments patient={patient || selectValue} />
  } else {
    return <PatientName patient={patient || selectValue} />
  }
}

const appointmentStyle = {
  display: 'flex',
  marginBottom: 4,
  marginLeft: 4
}

const assigneeNameStyle = {
  alignSelf: 'flex-end',
  color: darkGrayDisabled,
  flexGrow: 1,
  textAlign: 'right'
}
