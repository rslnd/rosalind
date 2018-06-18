import React from 'react'
import moment from 'moment-timezone'
import { FormSection, Field } from 'redux-form'
import Button from 'material-ui/Button'
import { TAPi18n } from 'meteor/tap:i18n'
import { TagsField } from '../../tags/TagsField'
import { tagStyle, tagBackgroundColor } from '../../tags/TagsList'
import { UserHelper } from '../../users/UserHelper'
import { Icon } from '../../components/Icon'
import { PatientPickerUpsert } from '../../patients/PatientPickerUpsert'
import { flex, grow, shrink, TextField } from '../../components/form'

const pauseButtonStyle = {
  ...tagStyle,
  backgroundColor: tagBackgroundColor,
  cursor: 'pointer'
}

const tagsRowStyle = {
  ...flex,
  paddingTop: 10
}

export const NewAppointmentFields = props => {
  const {
    time,
    allowedTags,
    maxDuration,
    calendarId,
    assigneeId,
    pristine,
    submitting,
    handleSubmit,
    onSubmit,
    onSubmitPause,
    patientId,
    extended,
    change
  } = props

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <FormSection name='patient'>
        <div style={flex}>
          <PatientPickerUpsert
            autoFocus
            patientId={patientId}
            extended={extended}
            change={change} />
        </div>
      </FormSection>

      <FormSection name='appointment'>
        {/* Tags */}
        <div style={tagsRowStyle}>
          <div style={grow}>
            <Field
              name='tags'
              component={TagsField}
              allowedTags={allowedTags}
              maxDuration={maxDuration}
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
            fullWidth
            label={TAPi18n.__('appointments.note')} />
        </div>
      </FormSection>

      <div style={flex}>
        <Summary time={time} assigneeId={assigneeId} />
      </div>

      <div style={flex}>
        <Button variant='raised' type='submit'
          onClick={handleSubmit}
          fullWidth
          color='primary'
          disabled={submitting || (pristine && !patientId)}>
          {
            submitting
              ? <Icon name='refresh' spin />
              : TAPi18n.__('appointments.thisSave')
          }
        </Button>
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
