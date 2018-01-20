import React from 'react'
import moment from 'moment-timezone'
import { Field } from 'redux-form'
import RaisedButton from 'material-ui/RaisedButton'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import { TagsField } from '../../tags/TagsField'
import { tagStyle, tagBackgroundColor } from '../../tags/TagsList'
import { UserHelper } from '../../users/UserHelper'
import { Icon } from '../../components/Icon'
import { PatientPickerUpsert } from '../../patients/PatientPickerUpsert'
import { flex, grow, shrink } from '../../components/form/rowStyle'

const pauseButtonStyle = {
  ...tagStyle,
  backgroundColor: tagBackgroundColor,
  cursor: 'pointer'
}

export const NewAppointmentFields = props => {
  const {
    time,
    allowedTags,
    calendarId,
    assigneeId,
    pristine,
    submitting,
    handleSubmit,
    onSubmit,
    onSubmitPause,
    patientId,
    extended
  } = props

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <div style={flex}>
        <PatientPickerUpsert
          autoFocus
          patientId={patientId}
          extended={extended} />
      </div>

      {/* Tags */}
      <div style={flex}>
        <div style={grow}>
          <Field
            name='tags'
            component={TagsField}
            allowedTags={allowedTags}
            calendarId={calendarId}
            assigneeId={assigneeId}
            showDefaultRevenue={false}
            fullWidth />
        </div>
        <div style={shrink}>
          <div
            style={pauseButtonStyle}
            onClick={onSubmitPause}>PAUSE</div>
        </div>
      </div>

      {/* Note */}
      <div style={flex}>
        <Field name='appointmentNote'
          component={TextField}
          multiLine rows={1} fullWidth
          floatingLabelText={TAPi18n.__('appointments.form.note.label')} />
      </div>

      <div style={flex}>
        <Summary time={time} assigneeId={assigneeId} />
      </div>

      <div style={flex}>
        <RaisedButton type='submit'
          onClick={handleSubmit}
          fullWidth
          primary
          disabled={submitting || (pristine && !patientId)}
          label={submitting
            ? <Icon name='refresh' spin />
            : TAPi18n.__('appointments.thisSave')} />
      </div>
    </form>
  )
}

const summaryStyle = {
  marginBottom: 5
}

const Summary = ({ time, assigneeId }) => (
  <div style={summaryStyle}>
    <span className='text-muted'>{TAPi18n.__('appointments.thisSingular')}</span>&nbsp;
    {moment(time).format(TAPi18n.__('time.dateFormatWeekday'))}<br />

    <span className='text-muted'>{TAPi18n.__('time.at')}</span>&nbsp;
    <b>{moment(time).format(TAPi18n.__('time.timeFormat'))}</b><br />

    {
      assigneeId && <div>
        <span className='text-muted'>
          {TAPi18n.__('appointments.assignedTo')}&nbsp;
          <UserHelper helper='fullNameWithTitle' userId={assigneeId} />
        </span>
        <br />
      </div>
    }
  </div>
)
