import React from 'react'
import Alert from 'react-s-alert'
import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { compose, withState, withHandlers, withProps } from 'recompose'
import { Records, Calendars, Users } from '../../api'
import { subscribe } from '../../util/meteor/subscribe'
import { withTracker } from '../components/withTracker'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { Icon } from '../components/Icon'
import { Textarea } from '../patientAppointments/Field'
import { __ } from '../../i18n'
import { Button } from '@material-ui/core'
import { hasRole } from '../../util/meteor/hasRole'

const fullNameWithTitle = _id => {
  const user = _id && Users.findOne({ _id })
  return user && Users.methods.fullNameWithTitle(user)
}

const composer = props => {
  const { calendarId, patientId, currentAppointment } = props

  subscribe('records', { patientId })

  const record = Records.findOne({ calendarId, patientId })

  const userId = Meteor.userId()
  const canSee = hasRole(userId, ['records'])

  const canEdit = canSee && record &&
    (
      hasRole(userId, ['admin', 'records-edit']) ||
      (
        (record.createdBy === userId) &&
        moment(record.createdAt).isSame(moment(), 'day')
      )
    )

  const canInsert = canSee && !record

  const readOnly = canSee && !(canInsert || canEdit)

  const canResolve = record && canSee && (
    hasRole(userId, ['admin', 'records-edit']) || (
      currentAppointment && currentAppointment.calendarId === record.calendarId &&
      (
        userId === currentAppointment.assigneeId ||
        userId === currentAppointment.waitlistAssigneeId
      )
    )
  )

  return {
    ...props,
    record,
    canSee,
    canEdit,
    canInsert,
    readOnly,
    canResolve
  }
}

const action = p =>
  p.then(() => Alert.success(__('ui.saved')))

export const FutureRecord = compose(
  withState('selectedCalendarId', 'setCalendarId'),
  withProps(props => ({
    calendarId: props.selectedCalendarId || props.calendarId
  })),
  withTracker(composer),
  withHandlers({
    handleChange: props => note => {
      if (props.record) {
        if (note) {
          return action(Records.actions.setNote.callPromise({
            recordId: props.record._id,
            note
          }))
        } else {
          return action(Records.actions.remove.callPromise({
            recordId: props.record._id
          }))
        }
      } else {
        return action(Records.actions.insert.callPromise({
          patientId: props.patientId,
          calendarId: props.calendarId,
          note,
          type: 'future'
        }))
      }
    },
    handleRemove: props => e =>
      props.record && action(Records.actions.remove.callPromise({
        recordId: props.record._id
      }))
  })
)(({ record, handleChange, handleRemove, calendarId, setCalendarId, style, readOnly, canResolve, fieldStyle, canSee }) =>
  !canSee ? null : <div>
    {
      !readOnly
        ? (
          <CalendarSelector calendarId={calendarId} onChange={setCalendarId}>
            {({ calendar, onClick }) =>
              <span onClick={onClick} style={style}>
                Nachricht an nächste KollegIn
                &emsp;
                <span style={muted}>
                  {calendar ? calendar.name : 'Kalender wählen'} <Icon name='caret-down' />
                </span>
              </span>
            }
          </CalendarSelector>
        ) : (
          record &&
          <span style={style} title={moment(record.createdAt).format(__('time.dateFormatWeekdayShortNoYear'))}>
            {
              __('records.futureLabel', {
                name: fullNameWithTitle(record.createdBy)
              })
            }
          </span>
        )
    }

    {
      readOnly
        ? (
          (record && record.note) && <div>
            <div style={fieldStyle}>
              {record.note}
            </div>
            {
              canResolve &&
              <Button
                variant='contained'
                color='primary'
                onClick={handleRemove}
                style={resolveButtonStyle}
                className='pull-right'
              >OK, Gelesen</Button>
            }
          </div>
        ) : <Textarea
          initialValue={(record && record.note) || ''}
          onChange={handleChange}
          style={fieldStyle}
        />
    }
  </div>
)

const resolveButtonStyle = {
  // zoom: 0.7
}

const muted = {
  opacity: 0.8
}

const CalendarSelector = compose(
  withTracker(props => {
    const calendars = Calendars.find({}).fetch()
    const calendar = calendars.find(c => c._id === props.calendarId)
    return {
      ...props,
      calendars,
      calendar
    }
  }),
  withState('anchor', 'setAnchor', null),
  withHandlers({
    handleOpen: props => e => props.setAnchor(e.currentTarget),
    handleClose: props => e => props.setAnchor(null),
    handleSelect: props => calendarId => e => {
      props.onChange(calendarId)
      props.setAnchor(null)
    }
  })
)(({ calendar, calendars, anchor, handleOpen, handleClose, handleSelect, children }) =>
  <>
    {children({ calendar, onClick: handleOpen })}

    <Menu
      anchorEl={anchor}
      open={!!anchor}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
    >
      {
        calendars.map(c =>
          <MenuItem
            key={c._id}
            onClick={handleSelect(c._id)}
          >
            <Icon name={c.icon} />&emsp;{c.name}
          </MenuItem>
        )
      }
    </Menu>
  </>
)
