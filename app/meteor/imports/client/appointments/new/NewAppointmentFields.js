import { Meteor } from 'meteor/meteor'
import React from 'react'
import moment from 'moment-timezone'
import { FormSection, Field } from 'redux-form'
import Button from '@material-ui/core/Button'
import { __ } from '../../../i18n'
import { TagsField } from '../../tags/TagsField'
import { tagStyle, tagBackgroundColor, TagsList } from '../../tags/TagsList'
import { UserHelper } from '../../users/UserHelper'
import { Icon } from '../../components/Icon'
import { PatientPickerField } from '../../patients/picker'
import { flex, grow, shrink, TextField } from '../../components/form'
import { hasRole } from '../../../util/meteor/hasRole'
import { Calendars, Patients, Appointments } from '../../../api'
import { withTracker } from '../../components/withTracker'
import { getQ, q, format } from '../../../util/time/quarter'
import { subscribe } from '../../../util/meteor/subscribe'
import { getDefaultDuration } from '../../../api/appointments/methods/getDefaultDuration'

const QuarterWarning = withTracker(({ patientId, calendarId, start }) => {
  if (!patientId || patientId === 'newPatient') {
    return {}
  }

  subscribe('appointments-patient', { patientId, page: 0 })

  const selectedQ = q(getQ(start))(start)

  const sameQuarterAppointment = Appointments.findOne({
    canceledAt: null,
    patientId,
    calendarId,
    start: {
      $gte: selectedQ.start.toDate(),
      $lte: selectedQ.end.toDate()
    },
  })

  const quarter = format(start)

  if (!sameQuarterAppointment) {
    return {}
  }

  const patient = Patients.findOne({ patientId })

  return { sameQuarterAppointment, patient, quarter }
})(({ patient, sameQuarterAppointment, quarter }) =>
  sameQuarterAppointment
  ? <div className='pt3 pb1'>
      <div className='callout mb0 pt2 pb2 callout-warning enable-select'>
        Im Quartal ({quarter}) ist schon ein Termin am {moment(sameQuarterAppointment.start).format(__('time.dateFormatWeekdayShortNoYear'))} gebucht.
      </div>
    </div>
  : null
)


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
    start,
    end,
    scheduleableTags,
    allowedTags,
    tags,
    maxDuration,
    calendarId,
    assigneeId,
    pristine,
    valid,
    submitting,
    handleSubmit,
    onSubmit,
    onSubmitPause,
    patientId,
    extended,
    change,
    constraint
  } = props

  const calendar = Calendars.findOne({ _id: calendarId })

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <FormSection name='patient'>
        <PatientPickerField
          upsert
          extended={extended}
          change={change}
          requirePhone={calendar && calendar.requiredFields && calendar.requiredFields.includes('phone')}
          allowBanningPatients={(calendar && calendar.allowBanningPatients) || hasRole(Meteor.userId(), ['admin', 'patients-ban'])}
          nameEditable={patientId === 'newPatient'}
        />
      </FormSection>

      {calendar.sameQuarterWarning && patientId &&
        <QuarterWarning
          patientId={patientId}
          calendarId={calendarId}
          start={start}
        />
      }

      <FormSection name='appointment'>
        {/* Tags */}
        <div style={tagsRowStyle}>
          <div style={grow}>
            <Field
              name='tags'
              component={TagsField}
              scheduleableTags={scheduleableTags}
              allowedTags={allowedTags}
              maxDuration={maxDuration}
              calendarId={calendarId}
              assigneeId={assigneeId}
              showDefaultRevenue={false}
              autocorrectTags
              time={start}
              constraint={constraint}
              fullWidth />
          </div>
          <div style={shrink}>
            {(hasRole(Meteor.userId(), ['appointments-pause-all']) ||
             (hasRole(Meteor.userId(), ['appointments-pause-self']) && assigneeId === Meteor.userId())) &&
              <div
                style={pauseButtonStyle}
                onClick={onSubmitPause}>PAUSE</div>
            }


            {/* I'm sorry. */}
            {(hasRole(Meteor.userId(), ['appointments-extendDuration-all']) ||
             (hasRole(Meteor.userId(), ['appointments-extendDuration-self']) && assigneeId === Meteor.userId())) &&
              <div
                style={pauseButtonStyle}
                onClick={() => onSubmitPause({ note: 'Verlängerung' })}>Verlängerung</div>
            }
          </div>
        </div>

        {/* Note */}
        <div style={flex}>
          <Field name='note'
            component={TextField}
            fullWidth
            rows={1}
            rowsMax={5}
            multiline
            label={__('appointments.note')} />
        </div>
      </FormSection>

      <div style={flex}>
        <Summary
          start={start}
          assigneeId={assigneeId}
          calendarId={calendarId}
          tags={tags}
        />
      </div>

      <div style={flex} onClick={() => {
        // Reveal validation errors when disabled submit button is clicked
        if (pristine || !valid) {
          handleSubmit()
        }
      }}>
        <Button variant='contained' type='submit'
          onClick={handleSubmit}
          fullWidth
          color='primary'
          disabled={submitting || pristine || !valid}>
          {
            submitting
              ? <Icon name='refresh' spin />
              : __('appointments.thisSave')
          }
        </Button>
      </div>
    </form>
  )
}

const summaryStyle = {
  marginTop: 10,
  marginBottom: 5
}

const Summary = ({ calendarId, assigneeId, tags, start }) => {

  const duration = getDefaultDuration({
    calendarId,
    assigneeId,
    tags,
    date: moment(start)
  })

  return <div style={summaryStyle}>
    <TagsList tags={tags} tiny /><br />

    <span className='text-muted'>{__('appointments.thisSingular')}</span>&nbsp;
    {moment(start).format(__('time.dateFormatWeekday'))}<br />

    <span className='text-muted'>{__('time.at')}</span>&nbsp;
    <b>{moment(start).format(__('time.timeFormat'))}</b>&emsp;
    {duration && <span className='text-muted'>({duration} min)</span>}
    <br />

    {
      assigneeId && <div>
        <span className='text-muted'>
          {__('appointments.assignedTo')}&nbsp;
          <UserHelper helper='fullNameWithTitle' userId={assigneeId} />
        </span>
        <br />
      </div>
    }
  </div>
}
