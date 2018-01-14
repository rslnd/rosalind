import React from 'react'
import moment from 'moment-timezone'
import { Field, Fields } from 'redux-form'
import RaisedButton from 'material-ui/RaisedButton'
import Divider from 'material-ui/Divider'
import { TextField } from 'redux-form-material-ui'
import { TAPi18n } from 'meteor/tap:i18n'
import { RevenueField } from './RevenueField'
import { TagsField } from '../../tags/TagsField'
import { tagStyle, tagBackgroundColor } from '../../tags/TagsList'
import { UserHelper } from '../../users/UserHelper'
import { Icon } from '../../components/Icon'
import { PatientPickerUpsert } from '../../patients/PatientPickerUpsert'

const style = {
  padded: {
    padding: 10
  },
  tagsRow: {
    marginTop: -25
  },
  tagsField: {
    marginTop: 23,
    paddingLeft: 0,
    paddingRight: 0,
    zIndex: 5
  },
  tag: {
    ...tagStyle,
    backgroundColor: tagBackgroundColor,
    cursor: 'pointer'
  },
  noteField: {
    marginTop: -14,
    paddingLeft: 0,
    paddingRight: 0,
    zIndex: 4 // Fix notes field overlaying bottom ~10px of clickable tags
  },
  revenueField: {
    marginTop: -14,
    paddingLeft: 0,
    paddingRight: 0,
    zIndex: 3
  },
  summary: {
    marginBottom: 5
  }
}

const Summary = ({ time, assigneeId }) => (
  <div style={style.summary}>
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
    patientId
  } = props

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <div style={style.padded}>
        <div className='container-fluid'>
          <div className='row'>
            <PatientPickerUpsert
              patientId={patientId} />
          </div>
        </div>
      </div>
      <Divider />
      <div style={style.padded}>
        <div className='container-fluid'>

          {/* Tags */}
          <div className='row' style={style.tagsRow}>
            <div className='col-md-10' style={style.tagsField}>
              <Field
                name='tags'
                component={TagsField}
                allowedTags={allowedTags}
                calendarId={calendarId}
                assigneeId={assigneeId}
                showDefaultRevenue
                fullWidth />
            </div>
            <div className='col-md-2' style={style.tagsField}>
              <div
                style={style.tag}
                className='pull-right'
                onClick={onSubmitPause}>PAUSE</div>
            </div>
          </div>

          {/* Note */}
          <div className='row' style={style.noteRow}>
            <div className='col-md-12' style={style.noteField}>
              <Field name='appointmentNote'
                component={TextField}
                multiLine rows={1} fullWidth
                floatingLabelText={TAPi18n.__('appointments.form.note.label')} />
            </div>
          </div>

          <div className='row'>
            <Summary time={time} assigneeId={assigneeId} />
          </div>
          <div className='row'>
            <RaisedButton type='submit'
              onClick={handleSubmit}
              fullWidth
              primary
              disabled={submitting || (pristine && !patientId)}
              label={submitting
                ? <Icon name='refresh' spin />
                : TAPi18n.__('appointments.thisSave')} />
          </div>
        </div>
      </div>
    </form>
  )
}
