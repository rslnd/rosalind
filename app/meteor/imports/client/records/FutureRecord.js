import React from 'react'
import Alert from 'react-s-alert'
import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { compose, withState, withHandlers, withProps } from 'recompose'
import { Records, Calendars } from '../../api'
import { subscribe } from '../../util/meteor/subscribe'
import { withTracker } from '../components/withTracker'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { Icon } from '../components/Icon'
import { Textarea } from '../patientAppointments/Field'
import { __ } from '../../i18n';

const composer = props => {
  const { calendarId, patientId } = props

  subscribe('records', { patientId })

  const record = Records.findOne({ calendarId, patientId })

  const canEdit = record &&
    (record.createdBy === Meteor.userId()) &&
    moment(record.createdAt).isSame(moment(), 'day')

  const canInsert = !record

  return {
    record,
    canEdit,
    canInsert
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
    }
  })
)(({ record, handleChange, calendarId, setCalendarId, style }) =>
  <div>
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

    <Textarea
      initialValue={record ? record.note : ''}
      onChange={handleChange}
    />
  </div>
)

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
