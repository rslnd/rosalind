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
import { Calendars } from '../../../api'

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
        />
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

const Summary = ({ start, assigneeId, tags }) => (
  <div style={summaryStyle}>
    <TagsList tags={tags} tiny /><br />

    <span className='text-muted'>{__('appointments.thisSingular')}</span>&nbsp;
    {moment(start).format(__('time.dateFormatWeekday'))}<br />

    <span className='text-muted'>{__('time.at')}</span>&nbsp;
    <b>{moment(start).format(__('time.timeFormat'))}</b><br />

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
)
